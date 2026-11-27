import { X509Certificate, createHash, verify as cryptoVerify } from 'node:crypto';

/**
 * Verifies App Store signed data (StoreKit 2 `Transaction.jwsRepresentation` and
 * App Store Server Notifications V2 `signedPayload`) without any third-party SDK.
 * Checks: ES256 signature by the leaf certificate, leaf ← intermediate ← Apple Root CA - G3 chain,
 * certificate validity dates, and the pinned root fingerprint.
 */
const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;
const APPLE_ROOT_SHA256 = '63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79';

export const BUNDLE_ID = 'com.colecollins.nospamcalls';
export const BURNER_PRODUCTS = new Set(['com.colecollins.nospamcalls.burner.annual', 'com.colecollins.nospamcalls.burner.weekly']);

export class AppStoreVerifyError extends Error {}

const b64url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export function verifyAppleJws<T = Record<string, unknown>>(jws: string, now = new Date()): T {
	const parts = jws.split('.');
	if (parts.length !== 3) throw new AppStoreVerifyError('Malformed signed data');
	let header: { alg?: string; x5c?: string[] };
	try {
		header = JSON.parse(b64url(parts[0]).toString('utf8'));
	} catch {
		throw new AppStoreVerifyError('Malformed header');
	}
	if (header.alg !== 'ES256' || !Array.isArray(header.x5c) || header.x5c.length !== 3) throw new AppStoreVerifyError('Unexpected signing format');
	let leaf: X509Certificate, intermediate: X509Certificate, root: X509Certificate;
	try {
		[leaf, intermediate, root] = header.x5c.map((c) => new X509Certificate(Buffer.from(c, 'base64')));
	} catch {
		throw new AppStoreVerifyError('Unreadable certificate');
	}
	const pinned = new X509Certificate(APPLE_ROOT_CA_G3_PEM);
	if (root.fingerprint256 !== APPLE_ROOT_SHA256 || pinned.fingerprint256 !== APPLE_ROOT_SHA256 || !root.raw.equals(pinned.raw)) {
		throw new AppStoreVerifyError('Untrusted root certificate');
	}
	if (!intermediate.verify(root.publicKey) || !leaf.verify(intermediate.publicKey)) throw new AppStoreVerifyError('Broken certificate chain');
	for (const c of [leaf, intermediate, root]) {
		if (new Date(c.validFrom) > now || new Date(c.validTo) < now) throw new AppStoreVerifyError('Certificate outside its validity period');
	}
	const ok = cryptoVerify('sha256', Buffer.from(`${parts[0]}.${parts[1]}`), { key: leaf.publicKey, dsaEncoding: 'ieee-p1363' }, b64url(parts[2]));
	if (!ok) throw new AppStoreVerifyError('Bad signature');
	return JSON.parse(b64url(parts[1]).toString('utf8')) as T;
}

export type AppleTransaction = {
	bundleId: string;
	productId: string;
	originalTransactionId: string;
	transactionId: string;
	expiresDate?: number;
	revocationDate?: number;
	environment?: 'Production' | 'Sandbox' | 'Xcode';
};

/** Returns the verified transaction if it is an active Pro + Burner subscription for this app. */
export function activeBurnerTransaction(jws: string): AppleTransaction {
	const t = verifyAppleJws<AppleTransaction>(jws);
	if (t.bundleId !== BUNDLE_ID) throw new AppStoreVerifyError('Purchase is for a different app');
	if (!BURNER_PRODUCTS.has(t.productId)) throw new AppStoreVerifyError('This purchase does not include a burner number');
	if (t.revocationDate) throw new AppStoreVerifyError('This purchase was refunded or revoked');
	if (!t.expiresDate || t.expiresDate < Date.now()) throw new AppStoreVerifyError('This subscription has expired');
	return t;
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

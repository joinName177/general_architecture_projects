export const secretPatterns = [
  /-----BEGIN (?:EC|OPENSSH|PGP|RSA) PRIVATE KEY-----/u,
  /AKIA[0-9A-Z]{16}/u,
  /gh[pousr]_[A-Za-z0-9_]{20,}/u,
  /(?:api|auth|private|secret)[_-]?key\s*[:=]\s*["'][^"']{8,}/iu,
];

export function containsPotentialSecret(contents) {
  return secretPatterns.some((pattern) => pattern.test(contents));
}

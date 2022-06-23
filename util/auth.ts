import Tokens from 'csrf';

const tokens = new Tokens();

export function createCsrfSeed() {
  return tokens.secretSync();
}

export function createCsrfToken(seed: string) {
  return tokens.create(seed);
}

export function verifyCsrfToken(seed: string, csrfToken: string) {
  return tokens.verify(seed, csrfToken);
}

const TYPE_VALIDATION = 1;
const TYPE_EXECUTION = 2;
const TYPE_FALLBACK = 3;
const TYPE_HOOK = 4;
const TYPE_POLICY = 5;
const TYPE_SIGNER = 6;
const TYPE_ACTION = 7;

function getName(type: number): string {
  switch (type) {
    case TYPE_VALIDATION:
      return 'validation';
    case TYPE_EXECUTION:
      return 'execution';
    case TYPE_FALLBACK:
      return 'fallback';
    case TYPE_HOOK:
      return 'hook';
    case TYPE_POLICY:
      return 'policy';
    case TYPE_SIGNER:
      return 'signer';
    case TYPE_ACTION:
      return 'action';
    default:
      return 'unknown';
  }
}

export {
  TYPE_VALIDATION,
  TYPE_EXECUTION,
  TYPE_FALLBACK,
  TYPE_HOOK,
  TYPE_POLICY,
  TYPE_SIGNER,
  TYPE_ACTION,
  getName,
};

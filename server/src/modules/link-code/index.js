function getLinkingCode(userIds) {
  return userIds.map(BigInt)
      .sort((a,b) => a < b ? -1 : a === b ? 0 : 1)
      .map(i => (i >> 22n) % 10000n)
      .map(i => i.toString().padStart(4, '0'))
      .join('');
}

export default getLinkingCode;

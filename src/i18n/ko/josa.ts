// 한국어 조사 '(으)로'. 받침이 없거나 ㄹ 받침이면 '로', 그 밖의 받침이면 '으로'를 붙인다.
// 한글이 아닌 글자로 끝나면(예: HOT) 받침을 알 수 없어서 '(으)로'로 둔다.
export function euro(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  if (code < 0 || code > 11171) return `${word}(으)로`
  const finalConsonant = code % 28 // 0은 받침 없음, 8은 ㄹ
  return finalConsonant === 0 || finalConsonant === 8 ? `${word}로` : `${word}으로`
}

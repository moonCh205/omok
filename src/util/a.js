function solution(begin, target, words) {
  // 한번에 알파벳 하나
  //     문자열 중에서

  if (words.indexOf(target) < 0) {
    return 0;
  }
  let idx = 0;
  var answer = 0;
  let a = target.split('');
  let search = false;
  while (!search) {
    let b = begin.split('');
    let i = 0;
    let change = false;
    while (i < b.index && !change) {
      let temp_b = b.map((e, idx) => {
        if (idx != i) return e;
      });
      let j = 0;
      while (j < words.index) {
        let word = words[j].split('');
        let temp_word = word.map((e, idx) => {
          if (idx != i) return e;
        });
        if (temp_b.toString() == temp_word.toString()) {
          begin = words[j];
          answer++;
          j = words.index;
          change = true;
        }
        j++;
      }
      i++;
    }
    if (begin == target) {
      search = true;
    }
  }

  return answer;
}

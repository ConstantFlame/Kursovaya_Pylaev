const factorial = (n) => {
  return (n != 1) ? n * factorial(n - 1) : 1
}

const Math1 = (r, n) => {   // Функция нахождения вероятности загрузки сервера
  return (Math.pow(r, n) / factorial(n))
}

const Math2 = (r, n, m) => { // Функция нахождения вероятности загрузки буфера
  return (Math.pow(r, (n + m)) / (Math.pow(n, m) * factorial(n)) )
}

const CalculateP0 = (r, n, m) => {  // функция нахождения P0 - вероятность того, что ВС не загружена
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 1; i <= n; i++) {
    sum1 += Math1(r, i)
  }

  for (let j = 1; j <= m; j++) {
    sum2 += Math2(r, n, j)
  }

  return Math.pow((1 + sum1 + sum2), -1)
}

let CalculateP = (r, n, m) => { // Функция вычисления всех предельных вероятностей

  let P = [];

  P[0] = CalculateP0(r, n, m);

  for (let k = 1; k <= n; k++) { // Вычисление P1, P2, P3, P4
    P[k] = Math1(r, k) * P[0]
  }

  for (let j = 1; j <= m; j++) { // Вычисление P5, P6, P7
    P[n + j] = Math2(r, n, j) * P[0]
  }

  return P;

}

const CalculateBufferN = (r, n, m, x, p0) => { // Функция нахождения среднего числа программ в буфере

  let E = 0;
  if (x === 1) {
    for (let i = 0; i < m; i ++) {
      E += (i + 1) * Math.pow(x, i);
    }
  } else {
    E = (1 - Math.pow(x, m) * (m + 1 - m*x))/Math.pow( (1-x), 2);
  }
  return (Math2(r, n, 1) * p0 * E);
}

function CalculateParameters (elem) {

  const N = elem.n; // Количество серверов

  const M = elem.m; // Размер очереди (буфера)
  
  const L = elem.l; // Интенсивность потока

  const Mu = elem.mu; // Интенсивность потока обслуживания

  const Ro = L / Mu;

  const X = Ro/N;

  const P = CalculateP(Ro, N, M); // Массив предельных вероятностей

  const RejectionP = Math2(Ro, N, M) * P[0]; // Вероятность отказа в обслуживании заявки

  const Q = 1 - RejectionP; // Относительная пропускная способность

  const S = L * Q; // Абсолютная пропускная способность

  const K = S / Mu; // Среднее число занятых каналов

  const BufferfN = CalculateBufferN(Ro, N, M, X, P[0]); // Среднее число программ в буфере

  const ProgramN = K + BufferfN; // Среднее число программ в ВС

  const BufferT = BufferfN / (Ro * Mu); // Среднее время нахождения программы в буфере

  const ProgramT = BufferT + Q / Mu; // Среднее время нахождения программы в ВС


  return (`\nP0 = ${P[0].toFixed(3)}; \nP1 = ${P[1].toFixed(3)}; \nP2 = ${P[2].toFixed(3)}; \nP3 = ${P[3].toFixed(3)}; \nP4 = ${P[4].toFixed(3)};
  P5 = ${P[5].toFixed(3)}; \nP6 = ${P[6].toFixed(3)}; \nP7 = ${P[7].toFixed(3)};
  \nВероятность отказа: ${RejectionP.toFixed(3)};
  Q – относительная пропускная способность ВС – средняя доля программ, обработанных ВС: ${Q.toFixed(3)};
  S – абсолютная пропускная способность – среднее число программ, обработанных в единицу времени: ${S.toFixed(3)};
  K - среднее число занятых серверов: ${K.toFixed(3)};
  Nбуф.- среднее число программ в буфере (среднее число находящихся в очереди заявок): ${BufferfN.toFixed(3)};
  Nпрог.- среднее число программ в ВС (среднее число находящихся в системе заявок): ${ProgramN.toFixed(3)};
  Tбуф – среднее время нахождения программы в буфере (среднее время ожидания заявки в очереди): ${BufferT.toFixed(3)};
  Tпрог – среднее время нахождения программы в ВС (среднее время пребывания заявки в системе): ${ProgramT.toFixed(3)}`);
}
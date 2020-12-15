function randomInteger(min, max) { // Функция рандома, необходимая для получения случайного числа от min до max+1
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function calcProgramsLine(TzMIN, TzMAX, TsMIN, TsMAX, TIMEWORK) { // Функция для нахождение программ (заявок) по линейному закону
  let programs = [];
  let t = 0;
  let lastT = 0;
  while (t <= TIMEWORK) {
    const U = randomInteger(1, 100) / 100;
    const tPrihod = (TzMAX - TzMIN) * U + TzMIN;
    const tObrabotka = (TsMAX - TsMIN) * U + TsMIN;
    const T = lastT + tPrihod;

    if (T <= TIMEWORK) {
      programs.push({
        U: U,
        tPrihod: tPrihod,
        tObrabotka: tObrabotka,
        time: T,
        inBoof: false,
      });
    }

    lastT = T;
    t = T - programs[0].time; // Это условие необходимо, т.к. вычислительная система начинает работу с приходом первой программы
  }

  return programs;
}

function calcProgramsExp(lambda, Mu, TIMEWORK) { // Функция нахождения программ (заявок) по экспоненциальному закону
  let programs = [];
  let t = 0;
  let lastT = 0;
  while (t <= TIMEWORK) {
    const U = randomInteger(1, 100) / 100;
    const tPrihod = -1 / lambda * Math.log(U);
    const tObrabotka = -1 / Mu * Math.log(U);
    const T = lastT + tPrihod;

    if (T <= TIMEWORK) {
      programs.push({
        U: U,
        tPrihod: tPrihod,
        tObrabotka: tObrabotka,
        time: T,
        inBoof: false,
      });
    }

    lastT = T;
    t = T - programs[0].time; // Это условие необходимо, т.к. вычислительная система начинает работу с приходом первой программы
  }

  return programs;
}


function creatServers(n) { // Функция создания серверов
  let servers = [];
  for (let i = 0; i < n; i++) {
    servers.push({ id: i + 1, array: [], t: 0, downTime: 0 })
  }
  return servers;
  // array - это массив программ, поступивших на данный сервер, downTime - время простоя сервера
  // t - время, когда освободится сервер, id - номер сервера
}

function modeling(programs, servers, n, m, time, L, Mu) { // Функция моделирования работы ВС с расчетом характеристик
  let boof = []; // Буфер
  let count = 0; // Сount - счетчик, считающий необработанные команды
  let P = []; // Массив вероятноестей P0 - P7
  for (let i = 0; i <= n + m; i++) { // Цикл для заполнения массива вероятностей нулями, это делается для того, чтобы не возникло ошибок в вычислении
    P.push(0);
  }
  let ArrayForParameters = []; // Массив, служащий для вычисления вероятностей P0 - P7

  for (let i = 0; i < programs.length; i++) { // Цикл по программам (заявкам)

    let fl = true;  // Используем флаг, при условии, что он true - программа не попадет на сервер
    for (let j = 0; j < n; j++) { // Цикл по серварам

      while (programs[i].time > servers[j].t) { // Пока сервер свободен
        if (boof.length > 0) { // Проверяем Если в буфере есть заявки, тогда обработаем для сначала их

          // Ниже вычисляем время для вероятностей P0 - P7
          servers.sort((elem1, elem2) => elem1.t - elem2.t);
          ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
          ArrayForParameters[1].status = 'prihod'; // Статус прихода, когда программа (заявка) поступила на сервер 
          ArrayForParameters[1].flBoof = 'true'; // Попадает в буфер
          ArrayForParameters[1].flagPrihoda = 'true'; // Пришел на сервер

          if (ArrayForParameters[1].time + boof[0].tObrabotka <= time) { // Если время превышает значение в 3600
            ArrayForParameters.push({ time: ArrayForParameters[1].time + boof[0].tObrabotka, status: 'obrabotka', flBoof: true, flagPrihoda: false });
          } else {
          ArrayForParameters.push({ time: time, status: 'obrabotka', flBoof: true, flagPrihoda: false });
          }

          ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
          P[n + boof.length] += ArrayForParameters[1].time - ArrayForParameters[0].time;
          ArrayForParameters.shift();
          ArrayForParameters[0].flagPrihoda = false;

          // Добавляем программу из буфера на сервер
          const progaOutBoof = boof.shift();
          servers[0].array.push(progaOutBoof);
          servers[0].t += progaOutBoof.tObrabotka;
          servers.sort((elem1, elem2) => elem1.id - elem2.id);

        } else { // Иначе - в буфере пусто, поэтому добавляем программу на сервер

          // Вычисление времени для вероятностей
          if (ArrayForParameters.length === 0) { // Если массив пустой, то это самая первая программа, до заявок не было
            P[0] = programs[i].time;
            ArrayForParameters.push({ time: programs[i].time, status: 'prihod', flBoof: false, flagPrihoda: false });
            ArrayForParameters.push({ time: programs[i].time + programs[i].tObrabotka, status: 'obrabotka', flBoof: false, flagPrihoda: false });
          } else {

            ArrayForParameters.push({ time: programs[i].time, status: 'prihod', flBoof: false, flagPrihoda: true });

            if (programs[i].time + programs[i].tObrabotka <= time) {
              ArrayForParameters.push({ time: programs[i].time + programs[i].tObrabotka, status: 'obrabotka', flBoof: false, flagPrihoda: false });
            } else {
              ArrayForParameters.push({ time: time, status: 'obrabotka', flBoof: false, flagPrihoda: false });
            }

            let flag = false; // Флаг проверки первого элемента массива для вычисления вероятностей

            while (!flag) {
              ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
              let countServers = 0;

              for (let k = 0; k < n; k++) {
                if (ArrayForParameters[1].time <= servers[k].t) {
                  countServers++;
                }
              }

              P[countServers] += ArrayForParameters[1].time - ArrayForParameters[0].time;
              ArrayForParameters.shift();
              if (ArrayForParameters[0].flagPrihoda) {
                flag = true;
                ArrayForParameters[0].flagPrihoda = false;
              }
            }

            // Добавление заявки на сервер
            servers[j].array.push(programs[i]);
            servers[j].downTime += programs[i].time - servers[j].t; // Время, сервер ничего обрабатывает, то есть простаивает
            servers[j].t = programs[i].time + programs[i].tObrabotka;
            fl = false; // Флаг false - программ не попадает на буфер, соответсвенно идет на сервер 

          }
        }
      }

      if (!fl) { // Когда программа попала на сервер, 
        break; // то прекращаем перебор по серверам
      }
    }

    if (fl) { // Если программа не попала на сервер, то
      if (boof.length < m) { // если есть место в буфере

        // Тогда считаем время для вероятностей P0 - P7
        ArrayForParameters.push({ time: programs[i].time, status: 'boofer', flBoof: true, flagPrihoda: true });
        ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
        P[n + boof.length] += ArrayForParameters[1].time - ArrayForParameters[0].time;
        ArrayForParameters.shift();
        ArrayForParameters[0].flagPrihoda = false;

        // И добавляем программу в буфер
        programs[i].inBoof = true;
        boof.push(programs[i]);

      } else { // Если программа не обрабатывается

        count++; // Считаем количество необработанных программ
        // Считаем время для вероятностей P0 - P7
        ArrayForParameters.push({ time: programs[i].time, status: 'unfinished', flBoof: false, flagPrihoda: true });
        ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
        P[n + boof.length] += ArrayForParameters[1].time - ArrayForParameters[0].time;
        ArrayForParameters.shift();
        ArrayForParameters[0].flagPrihoda = false;
      }
    }
  }

  while (boof.length > 0) { // Если в буфере остались программы в конце
    servers.sort((elem1, elem2) => elem1.t - elem2.t)

    // тогда вычисляем время для вероятностей
    ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
    ArrayForParameters[1].status = 'prihod';
    ArrayForParameters[1].flBoof = 'true';
    ArrayForParameters[1].flagPrihoda = 'true';

    if (ArrayForParameters[1].time + boof[0].tObrabotka <= time) {
      ArrayForParameters.push({ time: ArrayForParameters[1].time + boof[0].tObrabotka, status: 'obrabotka', flBoof: true, flagPrihoda: false });
    } else {
      ArrayForParameters.push({ time: time, status: 'obrabotka', flBoof: true, flagPrihoda: false });
    }

    ArrayForParameters.sort((elem1, elem2) => elem1.time - elem2.time);
    P[n + boof.length] += ArrayForParameters[1].time - ArrayForParameters[0].time;
    ArrayForParameters.shift();
    ArrayForParameters[0].flagPrihoda = false;

    // Исключаем программы из буфера и отправляем их на сервер
    const progaOutBoof = boof.shift();
    servers[0].array.push(progaOutBoof);
    servers[0].t += progaOutBoof.tObrabotka;
    servers.sort((elem1, elem2) => elem1.id - elem2.id)
  }


  // Вычисления остальные характеристик 
  const Ro = L / Mu;
  const X = Ro/n;

  const otkazP = count/programs.length; // Вероятность отказа в обслуживании заявки
  const Q = 1 - otkazP; // Относительная пропускная способность
  const S = L * Q; // Абсолютная пропускная способность
  const K = S / Mu; // Среднее число занятых каналов
  const BoofN = calcBoofN(Ro, n, m, X, (P[0]/time)); // Среднее число программ в буфере
  const ProgN = K + BoofN; // Среднее число программ в ВС
  const BoofT = BoofN / (Ro * Mu); // Среднее время нахождения программы в буфере
  const ProgT = BoofT + Q / Mu; // Среднее время нахождения программы в ВС

let text = `Результат работы ВС за ${time} секунд:`;
for (let i = 0; i < n; i++) {
  text += `\nВремя простоя первого сервера ${servers[i].downTime.toFixed(2)} секунд;\nКоличество программ поступившик на этот сервер ${servers[i].array.length};`
}

for (let i = 0; i <= n + m; i++) {
  text += `\nP[${i}] = ${(P[i] / time).toFixed(5)};`
}

text += `\nВероятность отказа: ${otkazP.toFixed(3)};
Относительная пропускная способность ВС: ${Q.toFixed(3)};
Абсолютная пропускная способность ВС: ${S.toFixed(3)};
Среднее число занятых серверов: ${K.toFixed(3)};
Среднее число программ в буфере: ${BoofN.toFixed(3)};
Среднее чесло программ в ВС: ${ProgN.toFixed(3)};
Среднее время нахождения программы в буфере: ${BoofT.toFixed(3)};
Среднее время нахождения программы в ВС: ${ProgT.toFixed(3)};`



  return (text);

}





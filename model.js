function RandInt(min, max) { // Функция рандома, необходимая для получения случайного числа от min до max+1
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function CalculateProgramLine(TzMIN, TzMAX, TsMIN, TsMAX, TIMEWORK) { // Функция для нахождение программ (заявок) по линейному закону
  let programs = [];
  let t = 0;
  let lastT = 0;
  while (t <= TIMEWORK) {
    const U = RandInt(1, 100) / 100;
    const tComing = (TzMAX - TzMIN) * U + TzMIN;
    const tProcessing = (TsMAX - TsMIN) * U + TsMIN;
    const T = lastT + tComing;

    if (T <= TIMEWORK) {
      programs.push({
        U: U,
        tPrihod: tComing,
        tObrabotka: tProcessing,
        time: T,
        inBuffer: false,
      });
    }

    lastT = T;
    t = T - programs[0].time; // Это условие необходимо, т.к. вычислительная система начинает работу с приходом первой программы
  }

  return programs;
}

function CalculateProgramExp(lambda, Mu, TIMEWORK) { // Функция нахождения программ (заявок) по экспоненциальному закону
  let programs = [];
  let t = 0;
  let lastT = 0;
  while (t <= TIMEWORK) {
    const U = RandInt(1, 100) / 100;
    const tComing = -1 / lambda * Math.log(U);
    const tProcessing = -1 / Mu * Math.log(U);
    const T = lastT + tComing;

    if (T <= TIMEWORK) {
      programs.push({
        U: U,
        tPrihod: tComing,
        tObrabotka: tProcessing,
        time: T,
        inBuffer: false,
      });
    }

    lastT = T;
    t = T - programs[0].time; // Это условие необходимо, т.к. вычислительная система начинает работу с приходом первой программы
  }

  return programs;
}


function CreateServers(n) { // Функция создания серверов
  let servers = [];
  for (let i = 0; i < n; i++) {
    servers.push({ id: i + 1, array: [], t: 0, downTime: 0 })
  }
  return servers;
  // array - это массив программ, поступивших на данный сервер, downTime - время простоя сервера
  // t - время, когда освободится сервер, id - номер сервера
}

function Modeling(programs, servers, n, m, time, L, Mu) { // Функция моделирования работы ВС с расчетом характеристик
  let boof = []; // Буфер
  let count = 0; // Сount - счетчик, считающий необработанные команды
  let P = []; // Массив вероятноестей P0 - P7
  for (let i = 0; i <= n + m; i++) { // Цикл для заполнения массива вероятностей нулями, это делается для того, чтобы не возникло ошибок в вычислении
    P.push(0);
  }
  let ArrParameters = []; // Массив, служащий для вычисления вероятностей P0 - P7

  for (let i = 0; i < programs.length; i++) { // Цикл по программам (заявкам)

    let fl = true;  // Используем флаг, при условии, что он true - программа не попадет на сервер
    for (let j = 0; j < n; j++) { // Цикл по серварам

      while (programs[i].time > servers[j].t) { // Пока сервер свободен
        if (boof.length > 0) { // Проверяем если в буфере есть заявки, тогда обработаем для сначала их

          // Ниже вычисляем время для вероятностей P0 - P7
          servers.sort((elem1, elem2) => elem1.t - elem2.t);
          ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
          ArrParameters[1].status = 'prihod'; // Статус прихода, когда программа (заявка) поступила на сервер 
          ArrParameters[1].flBoof = 'true'; // Попадает в буфер
          ArrParameters[1].flagComing = 'true'; // Пришел на сервер

          if (ArrParameters[1].time + boof[0].tObrabotka <= time) { // Если время превышает значение в 3600
            ArrParameters.push({ time: ArrParameters[1].time + boof[0].tObrabotka, status: 'obrabotka', flBoof: true, flagComing: false });
          } else {
          ArrParameters.push({ time: time, status: 'obrabotka', flBoof: true, flagComing: false });
          }

          ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
          P[n + boof.length] += ArrParameters[1].time - ArrParameters[0].time;
          ArrParameters.shift();
          ArrParameters[0].flagComing = false;

          // Добавляем программу из буфера на сервер
          const ProgramOutOfBuffer = boof.shift();
          servers[0].array.push(ProgramOutOfBuffer);
          servers[0].t += ProgramOutOfBuffer.tObrabotka;
          servers.sort((elem1, elem2) => elem1.id - elem2.id);

        } else { // Иначе - в буфере пусто, поэтому добавляем программу на сервер

          // Вычисление времени для вероятностей
          if (ArrParameters.length === 0) { // Если массив пустой, то это самая первая программа, до заявок не было
            P[0] = programs[i].time;
            ArrParameters.push({ time: programs[i].time, status: 'prihod', flBoof: false, flagComing: false });
            ArrParameters.push({ time: programs[i].time + programs[i].tObrabotka, status: 'obrabotka', flBoof: false, flagComing: false });
          } else {

            ArrParameters.push({ time: programs[i].time, status: 'prihod', flBoof: false, flagComing: true });

            if (programs[i].time + programs[i].tObrabotka <= time) {
              ArrParameters.push({ time: programs[i].time + programs[i].tObrabotka, status: 'obrabotka', flBoof: false, flagComing: false });
            } else {
              ArrParameters.push({ time: time, status: 'obrabotka', flBoof: false, flagComing: false });
            }

            let flag = false; // Флаг проверки первого элемента массива для вычисления вероятностей

            while (!flag) {
              ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
              let countServers = 0;

              for (let k = 0; k < n; k++) {
                if (ArrParameters[1].time <= servers[k].t) {
                  countServers++;
                }
              }

              P[countServers] += ArrParameters[1].time - ArrParameters[0].time;
              ArrParameters.shift();
              if (ArrParameters[0].flagComing) {
                flag = true;
                ArrParameters[0].flagComing = false;
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
        ArrParameters.push({ time: programs[i].time, status: 'boofer', flBoof: true, flagComing: true });
        ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
        P[n + boof.length] += ArrParameters[1].time - ArrParameters[0].time;
        ArrParameters.shift();
        ArrParameters[0].flagComing = false;

        // И добавляем программу в буфер
        programs[i].inBuffer = true;
        boof.push(programs[i]);

      } else { // Если программа не обрабатывается

        count++; // Считаем количество необработанных программ
        // Считаем время для вероятностей P0 - P7
        ArrParameters.push({ time: programs[i].time, status: 'unfinished', flBoof: false, flagComing: true });
        ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
        P[n + boof.length] += ArrParameters[1].time - ArrParameters[0].time;
        ArrParameters.shift();
        ArrParameters[0].flagComing = false;
      }
    }
  }

  while (boof.length > 0) { // Если в буфере остались программы в конце
    servers.sort((elem1, elem2) => elem1.t - elem2.t)

    // тогда вычисляем время для вероятностей
    ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
    ArrParameters[1].status = 'prihod';
    ArrParameters[1].flBoof = 'true';
    ArrParameters[1].flagComing = 'true';

    if (ArrParameters[1].time + boof[0].tObrabotka <= time) {
      ArrParameters.push({ time: ArrParameters[1].time + boof[0].tObrabotka, status: 'obrabotka', flBoof: true, flagComing: false });
    } else {
      ArrParameters.push({ time: time, status: 'obrabotka', flBoof: true, flagComing: false });
    }

    ArrParameters.sort((elem1, elem2) => elem1.time - elem2.time);
    P[n + boof.length] += ArrParameters[1].time - ArrParameters[0].time;
    ArrParameters.shift();
    ArrParameters[0].flagComing = false;

    // Исключаем программы из буфера и отправляем их на сервер
    const ProgramOutOfBuffer = boof.shift();
    servers[0].array.push(ProgramOutOfBuffer);
    servers[0].t += ProgramOutOfBuffer.tObrabotka;
    servers.sort((elem1, elem2) => elem1.id - elem2.id)
  }


  // Вычисления остальных характеристик 
  const Ro = L / Mu;

  const X = Ro/n;

  const RejectionP = count/programs.length; // Вероятность отказа в обслуживании заявки

  const Q = 1 - RejectionP; // Относительная пропускная способность

  const S = L * Q; // Абсолютная пропускная способность

  const K = S / Mu; // Среднее число занятых каналов

  const BufferfN = CalculateBufferN(Ro, n, m, X, (P[0]/time)); // Среднее число программ в буфере

  const ProgramN = K + BufferfN; // Среднее число программ в ВС

  const BufferfT = BufferfN / (Ro * Mu); // Среднее время нахождения программы в буфере
  
  const ProgramT = BufferfT + Q / Mu; // Среднее время нахождения программы в ВС

let text = `Результат работы ВС за ${time} секунд:`;
for (let i = 0; i < n; i++) {
  text += `\nВремя простоя первого сервера ${servers[i].downTime.toFixed(2)} секунд;\nКоличество программ поступившик на этот сервер ${servers[i].array.length};`
}

for (let i = 0; i <= n + m; i++) {
  text += `\nP[${i}] = ${(P[i] / time).toFixed(5)};`
}

text += `\nPотк – вероятность отказа, т.е. того, что программа будет не обработанной: ${RejectionP.toFixed(3)};
Q – относительная пропускная способность ВС – средняя доля программ, обработанных ВС: ${Q.toFixed(3)};
S – абсолютная пропускная способность – среднее число программ, обработанных в единицу времени: ${S.toFixed(3)};
K - среднее число занятых серверов: ${K.toFixed(3)};
Nбуф.- среднее число программ в буфере (среднее число находящихся в очереди заявок): ${BufferfN.toFixed(3)};
Nпрог.- среднее число программ в ВС (среднее число находящихся в системе заявок): ${ProgramN.toFixed(3)};
Tбуф – среднее время нахождения программы в буфере (среднее время ожидания заявки в очереди): ${BufferfT.toFixed(3)};
Tпрог – среднее время нахождения программы в ВС (среднее время пребывания заявки в системе): ${ProgramT.toFixed(3)};`



  return (text);

}





let button = document.getElementById('button');
let coclusionLine = document.querySelector('.conclusion-line');
let conclusionExponential = document.querySelector('.conclusion-exponential');

function parse(str) { // Функция парсинка данных из input Функция получения (parse) данных из input
  if (str.indexOf('/', 0) != -1) {
    const arr = str.split('/');
    return +arr[0] / +arr[1];
  } else {
    return + str;
  }

}

function getData() { // Функция позволяющая получать данные из интерфейса
  return ({
    N: + document.getElementById('N').value, // Количество имеющихся серверов
    M: + document.getElementById('M').value, // Количество мест в буфере
    timework: parse(document.getElementById('timework').value),
    TzMIN: parse(document.getElementById('Tzmin').value),
    TzMAX: parse(document.getElementById('Tzmax').value),
    TsMIN: parse(document.getElementById('Tsmin').value),
    TsMAX: parse(document.getElementById('Tsmax').value),
    lambda: parse(document.getElementById('lambda').value),
    tobr: parse(document.getElementById('Tobr').value),
    Mu: 1 / parse(document.getElementById('Tobr').value),
  })
}

function checkDistribution() { // Функция для получения данных о выборе закона распределения
  const inp = document.getElementsByName('distribution');
  for (let i = 0; i < inp.length; i++) {
    if (inp[i].type === "radio" && inp[i].checked) {
      return inp[i].value;
    }
  }
}

function clickButton () { // Функция тапа по кнопке
  const data = getData();
  const method = checkDistribution();

  if (!data.N || !data.timework) { // Проверка ввода необходимых данных
    alert ('Проверьте поля N и время работы программы')
    return false;
  }

  let prog = [];

  const elem = { // Объект с данными (нужны для вычислений характеристик по формулам)
    n: data.N,
    m: data.M
  }

  if (method === 'line') { // При выборе экспоненциального или линейного закона распределения будут разные мю и лямбда
    if (!data.TzMIN || !data.TzMAX || !data.TsMIN || !data.TsMAX) { // Проверка ввода необходимых данных
      alert ('Проверьте поля TzMIN, TzMAX, TsMIN, и TsMAX')
      return false;
    }
    prog = calcProgramsLine(data.TzMIN, data.TzMAX, data.TsMIN, data.TsMAX, data.timework);
    elem.l = Math.pow((data.TzMIN + data.TzMAX) / 2, -1);
    elem.mu = Math.pow((data.TsMIN + data.TsMAX) / 2, -1);
  } else {
    if (!data.tobr || !data.lambda) { // Проверка ввода необходимых данных
      alert ('Проверьте поля λ и tобр')
      return false;
    }
    prog = calcProgramsExp(data.lambda, data.Mu, data.timework);
    elem.l = data.lambda;
    elem.mu = data.Mu;
  }

  let servers = creatServers(data.N); // Создаем сервара

  let conclusion = modeling(prog, servers, data.N, data.M, data.timework, elem.l, elem.mu); // Моделирование и расчет характеристик ВС

  // Если нужно посчитать хар-ки по формулам, то добавить вывод в интерфейс
  // const parametrs = calcParameters(elem); //вычисление характеристик ВС по формулам

  // let text = `\n\nХарактеристики ВС по формулам: ` + parametrs;


  if (method === 'line') {
    coclusionLine.textContent = conclusion; //Если понадобится расчет по формулам, то дабавляем + text после conclusion (текст в вывод)
  } else {
    conclusionExponential.textContent = conclusion;
  }

}








//console.log(calcParameters(linear));
//console.log(calcProgramsExp(L, Mu, TIMEWORK));


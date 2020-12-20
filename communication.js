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
  const Data = getData();
  const Method = checkDistribution();

  if (!Data.N || !Data.timework) { // Проверка ввода необходимых данных
    alert ('Проверьте поля N и время работы программы')
    return false;
  }

  let prog = [];

  const Element = { // Объект с данными (нужны для вычислений характеристик по формулам)
    n: Data.N,
    m: Data.M
  }

  if (Method === 'line') { // При выборе экспоненциального или линейного закона распределения будут разные мю и лямбда
    if (!Data.TzMIN || !Data.TzMAX || !Data.TsMIN || !Data.TsMAX) { // Проверка ввода необходимых данных
      alert ('Проверьте поля TzMIN, TzMAX, TsMIN, и TsMAX')
      return false;
    }
    prog = CalculateProgramLine(Data.TzMIN, Data.TzMAX, Data.TsMIN, Data.TsMAX, Data.timework);
    Element.l = Math.pow((Data.TzMIN + Data.TzMAX) / 2, -1);
    Element.mu = Math.pow((Data.TsMIN + Data.TsMAX) / 2, -1);
  } else {
    if (!Data.tobr || !Data.lambda) { // Проверка ввода необходимых данных
      alert ('Проверьте поля λ и tобр')
      return false;
    }
    prog = CalculateProgramExp(Data.lambda, Data.Mu, Data.timework);
    Element.l = Data.lambda;
    Element.mu = Data.Mu;
  }

  let servers = CreateServers(Data.N); // Создаем сервара

  let conclusion = Modeling(prog, servers, Data.N, Data.M, Data.timework, Element.l, Element.mu); // Моделирование и расчет характеристик ВС

  // Если нужно посчитать хар-ки по формулам, то добавить вывод в интерфейс
  // const parametrs = CalculateParameters(Element); //вычисление характеристик ВС по формулам

  // let text = `\n\nХарактеристики ВС по формулам: ` + parametrs;


  if (Method === 'line') {
    coclusionLine.textContent = conclusion; //Если понадобится расчет по формулам, то дабавляем + text после conclusion (текст в вывод)
  } else {
    conclusionExponential.textContent = conclusion;
  }

}








//console.log(CalculateParameters(linear));
//console.log(CalculateProgramExp(L, Mu, TIMEWORK));


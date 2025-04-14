import logo from './logo.svg';
import './App.css';

function generatePolygonName(n) {
  const specialNames = {
    1: "monogon",
    2: "digon",
    3: "triangle",
    4: "quadrilateral",
    5: "pentagon",
    6: "hexagon",
    7: "heptagon",
    8: "octagon",
    9: "nonagon",
    10: "decagon",
    11: "hendecagon",
    12: "dodecagon"
  };
  if (specialNames[n]) return specialNames[n];

  if (n < 100) {
    if (n < 20) {
      const teenNames = {
        13: "tridecagon",
        14: "tetradecagon",
        15: "pentadecagon",
        16: "hexadecagon",
        17: "heptadecagon",
        18: "octadecagon",
        19: "enneadecagon"
      };
      return teenNames[n];
    }
    const tensMap = {
      1: "deca",
      2: "icosa",
      3: "triaconta",
      4: "tetraconta",
      5: "pentaconta",
      6: "hexaconta",
      7: "heptaconta",
      8: "octaconta",
      9: "enneaconta"
    };
    const onesMap = {
      1: "hen",
      2: "di",
      3: "tri",
      4: "tetra",
      5: "penta",
      6: "hexa",
      7: "hepta",
      8: "octa",
      9: "ennea"
    };
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    let name = tensMap[tens];
    if (ones !== 0) {
      name += "kai" + onesMap[ones];
    }
    return name + "gon";
  }

  if (n < 1000) {
    const hundredsMap = {
      1: "hecta",
      2: "dihecta",
      3: "trihecta",
      4: "tetrahecta",
      5: "pentahecta",
      6: "hexahecta",
      7: "heptahecta",
      8: "octahecta",
      9: "enneahecta"
    };
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    let name = hundredsMap[hundreds] || "";
    if (remainder !== 0) {
      name += "kai" + generatePolygonName(remainder).replace(/gon$/, "");
    }
    return name + "gon";
  }
  
  return `${n}-gon`;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

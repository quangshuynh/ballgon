import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

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

function getRandomPositionInsidePolygon(centerX, centerY, sides, R, ballRadius) {
  const incircleRadius = R * Math.cos(Math.PI / sides);
  const safeRadius = Math.max(0, incircleRadius - ballRadius);
  const r = Math.random() * safeRadius;
  const angle = Math.random() * 2 * Math.PI;
  return { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
}

function App() {
  const canvasWidth = Math.min(800, window.innerWidth * 0.95);
  const canvasHeight = Math.min(600, window.innerHeight * 0.7);
  const CENTER_X = canvasWidth / 2;
  const CENTER_Y = canvasHeight / 2;
  const POLY_RADIUS = canvasWidth * 0.3;
  const BALL_RADIUS = 20;
  const EDGE_THICKNESS = 10;
  const EDGE_EXTENSION = 5;
  
  const MAX_SPEED = 10;
  const MIN_SPEED = 1;
  
  const sceneRef = useRef(null);
  const [sides, setSides] = useState(3);
  const [polygonName, setPolygonName] = useState(generatePolygonName(3));
  const engineRef = useRef(null);
  const containerRef = useRef(null);
  const ballRef = useRef(null);
  
  useEffect(() => {
    const { Engine, Render, Runner, World, Bodies, Events } = Matter;
    
    const engine = Engine.create();
    engine.world.gravity.y = 1;
    engineRef.current = engine;
    
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: '#f0f0f0'
      }
    });

    const wallOptions = { 
      isStatic: true, 
      restitution: 1, 
      friction: 0, 
      frictionStatic: 0, 
      render: { fillStyle: '#aaa' } 
    };
    const walls = [
      Bodies.rectangle(canvasWidth / 2, canvasHeight + 30, canvasWidth + 20, 60, wallOptions),
      Bodies.rectangle(canvasWidth / 2, -30, canvasWidth + 20, 60, wallOptions),
      Bodies.rectangle(-30, canvasHeight / 2, 60, canvasHeight + 20, wallOptions),
      Bodies.rectangle(canvasWidth + 30, canvasHeight / 2, 60, canvasHeight + 20, wallOptions)
    ];
    World.add(engine.world, walls);
    
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    
    const createHollowPolygon = (sidesCount) => {
      if (containerRef.current) {
        containerRef.current.forEach(edge => {
          World.remove(engine.world, edge);
        });
      }
      let edges = [];
      const angleOffset = -Math.PI / 2;
      for (let i = 0; i < sidesCount; i++) {
        const angle1 = (2 * Math.PI * i) / sidesCount + angleOffset;
        const angle2 = (2 * Math.PI * (i + 1)) / sidesCount + angleOffset;
        const x1 = CENTER_X + POLY_RADIUS * Math.cos(angle1);
        const y1 = CENTER_Y + POLY_RADIUS * Math.sin(angle1);
        const x2 = CENTER_X + POLY_RADIUS * Math.cos(angle2);
        const y2 = CENTER_Y + POLY_RADIUS * Math.sin(angle2);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const edgeLength = Math.sqrt(dx * dx + dy * dy) + EDGE_EXTENSION;
        const edgeAngle = Math.atan2(dy, dx);
        const edge = Bodies.rectangle(midX, midY, edgeLength, EDGE_THICKNESS, {
          isStatic: true,
          angle: edgeAngle,
          restitution: 1,   
          friction: 0,
          frictionStatic: 0,
          render: {
            fillStyle: 'transparent',
            strokeStyle: '#000',
            lineWidth: 2
          },
          label: 'polygonEdge'
        });
        edges.push(edge);
        World.add(engine.world, edge);
      }
      containerRef.current = edges;
    };
    
    createHollowPolygon(sides);
    
    const initialPosition = getRandomPositionInsidePolygon(CENTER_X, CENTER_Y, sides, POLY_RADIUS, BALL_RADIUS);
    const ball = Bodies.circle(initialPosition.x, initialPosition.y, BALL_RADIUS, {
      restitution: 1.5,
      friction: 0,
      frictionAir: 0,
      label: 'ball',
      render: { fillStyle: '#FF4136' }
    });
    ballRef.current = ball;
    World.add(engine.world, ball);
    
    Matter.Body.setVelocity(ball, { x: 2, y: -2 });
    
    Events.on(engine, 'afterUpdate', () => {
      if (ballRef.current) {
        const vx = ballRef.current.velocity.x;
        const vy = ballRef.current.velocity.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          Matter.Body.setVelocity(ballRef.current, { x: vx * scale, y: vy * scale });
        }
        
        if (speed < MIN_SPEED) {
          const randomAngle = Math.random() * 2 * Math.PI;
          const boostX = Math.cos(randomAngle) * MIN_SPEED;
          const boostY = Math.sin(randomAngle) * MIN_SPEED;
          Matter.Body.setVelocity(ballRef.current, { x: boostX, y: boostY });
        }
      }
    });
    
    speechSynthesis.cancel();
    const initialUtterance = new SpeechSynthesisUtterance(`${generatePolygonName(sides)}!`);
    speechSynthesis.speak(initialUtterance);
    
    Events.on(engine, 'collisionStart', (event) => {
      const collisionDetected = event.pairs.some(pair =>
        (pair.bodyA.label === 'ball' && pair.bodyB.label === 'polygonEdge') ||
        (pair.bodyB.label === 'ball' && pair.bodyA.label === 'polygonEdge')
      );
      if (collisionDetected) {
        setSides(prev => prev + 1);
      }
    });    
    
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [canvasWidth, canvasHeight, CENTER_X, CENTER_Y, POLY_RADIUS, BALL_RADIUS, EDGE_THICKNESS, EDGE_EXTENSION, MAX_SPEED, MIN_SPEED]);
  
  useEffect(() => {
    if (!engineRef.current) return;
    const { World, Bodies } = Matter;
    
    if (containerRef.current) {
      containerRef.current.forEach(edge => {
        World.remove(engineRef.current.world, edge);
      });
    }
    const createHollowPolygon = (sidesCount) => {
      let edges = [];
      const angleOffset = -Math.PI / 2;
      for (let i = 0; i < sidesCount; i++) {
        const angle1 = (2 * Math.PI * i) / sidesCount + angleOffset;
        const angle2 = (2 * Math.PI * (i + 1)) / sidesCount + angleOffset;
        const x1 = CENTER_X + POLY_RADIUS * Math.cos(angle1);
        const y1 = CENTER_Y + POLY_RADIUS * Math.sin(angle1);
        const x2 = CENTER_X + POLY_RADIUS * Math.cos(angle2);
        const y2 = CENTER_Y + POLY_RADIUS * Math.sin(angle2);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const edgeLength = Math.sqrt(dx * dx + dy * dy) + EDGE_EXTENSION;
        const edgeAngle = Math.atan2(dy, dx);
        const edge = Bodies.rectangle(midX, midY, edgeLength, EDGE_THICKNESS, {
          isStatic: true,
          angle: edgeAngle,
          restitution: 1,
          friction: 0,
          frictionStatic: 0,
          render: {
            fillStyle: 'transparent',
            strokeStyle: '#000',
            lineWidth: 2
          },
          label: 'polygonEdge'
        });
        edges.push(edge);
        World.add(engineRef.current.world, edge);
      }
      containerRef.current = edges;
    };
    createHollowPolygon(sides);
    
    const newName = generatePolygonName(sides);
    setPolygonName(newName);
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${newName}!`);
    speechSynthesis.speak(utterance);
  }, [sides, CENTER_X, CENTER_Y, POLY_RADIUS, EDGE_EXTENSION, EDGE_THICKNESS]);
  
  const handleReset = () => {
    setSides(3);
    setPolygonName(generatePolygonName(3));
    if (engineRef.current && ballRef.current && containerRef.current) {
      const { World, Bodies } = Matter;
      World.remove(engineRef.current.world, ballRef.current);
      containerRef.current.forEach(edge => World.remove(engineRef.current.world, edge));
      
      const initialPosition = getRandomPositionInsidePolygon(CENTER_X, CENTER_Y, 3, POLY_RADIUS, BALL_RADIUS);
      const ball = Bodies.circle(initialPosition.x, initialPosition.y, BALL_RADIUS, {
        restitution: 1.5,
        friction: 0,
        frictionAir: 0,
        label: 'ball',
        render: { fillStyle: '#FF4136' }
      });
      ballRef.current = ball;
      World.add(engineRef.current.world, ball);
      Matter.Body.setVelocity(ball, { x: 2, y: -2 });
      
      const createHollowPolygon = (sidesCount) => {
        let edges = [];
        const angleOffset = -Math.PI / 2;
        for (let i = 0; i < sidesCount; i++) {
          const angle1 = (2 * Math.PI * i) / sidesCount + angleOffset;
          const angle2 = (2 * Math.PI * (i + 1)) / sidesCount + angleOffset;
          const x1 = CENTER_X + POLY_RADIUS * Math.cos(angle1);
          const y1 = CENTER_Y + POLY_RADIUS * Math.sin(angle1);
          const x2 = CENTER_X + POLY_RADIUS * Math.cos(angle2);
          const y2 = CENTER_Y + POLY_RADIUS * Math.sin(angle2);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const edgeLength = Math.sqrt(dx * dx + dy * dy) + EDGE_EXTENSION;
          const edgeAngle = Math.atan2(dy, dx);
          const edge = Bodies.rectangle(midX, midY, edgeLength, EDGE_THICKNESS, {
            isStatic: true,
            angle: edgeAngle,
            restitution: 1,
            friction: 0,
            frictionStatic: 0,
            render: {
              fillStyle: 'transparent',
              strokeStyle: '#000',
              lineWidth: 2
            },
            label: 'polygonEdge'
          });
          edges.push(edge);
          World.add(engineRef.current.world, edge);
        }
        containerRef.current = edges;
      };
      createHollowPolygon(3);
    }
  };
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f0f0',
        padding: '10px'
      }}>
      <div ref={sceneRef} style={{ marginBottom: '20px', width: '100%', maxWidth: canvasWidth }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Arial, sans-serif', margin: '0 0 10px 0' }}>
          {polygonName}
        </h2>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px', margin: '0 0 20px 0' }}>
          Sides: {sides}
        </p>
        <button onClick={handleReset} style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', border: 'none', backgroundColor: '#007BFF', color: '#E2E2E3'}}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;

/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Bridge w Bouncing Balls (matter.js + ml5.js)
Video Tutorial: https://youtu.be/K7b5MEhPCuo

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

// ml5.js 
let handPose;
let video;
let hands = [];

const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;

// Matter.js 
const {Engine, Body, Bodies, Composite, Composites, Constraint, Vector, World} = Matter;
let engine;
let bridge; let num = 10; let radius = 10; let length = 25;
let circles = [];

// 題庫陣列
const questions = [
  {
    q: "淡江大學教育科技學系的英文名稱是什麼？",
    options: [
      "A. Department of Educational Media",
      "B. Department of Instructional Technology",
      "C. Department of Digital Learning",
      "D. Department of Educational Technology",
      "E. Department of Information and Education"
    ],
    answer: "D"
  },
  {
    q: "下列哪一項最符合淡江大學教育科技學系的核心培養能力？",
    options: [
      "A. 財務分析與會計實務",
      "B. 教育科技整合與數位教材設計",
      "C. 生物醫學工程實驗技能",
      "D. 環境資源與永續發展",
      "E. 行銷與品牌管理"
    ],
    answer: "B"
  },
  {
    q: "淡江大學教育科技學系成立於哪一年？",
    options: [
      "A. 1974年",
      "B. 1980年",
      "C. 1984年",
      "D. 1990年",
      "E. 1996年"
    ],
    answer: "C"
  },
  {
    q: "以下哪一項不是淡江大學教育科技學系學生常接觸的主題？",
    options: [
      "A. 多媒體教學設計",
      "B. 虛擬實境與擴增實境",
      "C. 人工智慧在教育中的應用",
      "D. 電機電路分析",
      "E. 數位學習平台開發"
    ],
    answer: "D"
  },
  {
    q: "淡江大學教育科技學系的學生畢業後，以下哪一項職業最不相關？",
    options: [
      "A. 數位教材設計師",
      "B. 教育訓練規劃師",
      "C. 學習科技研究員",
      "D. 醫院臨床醫師",
      "E. E-learning 系統開發工程師"
    ],
    answer: "D"
  }
];

let currentQuestion = 0;

// 選項陣列
let options = ["A", "B", "C", "D", "E"];

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"]; 

let iansuiFont; // 加在最上方

let score = 0; // 新增在全域變數區

let countdown = 0;         // 倒數秒數（0 表示不用倒數）
let countdownStartTime = 0; // 記錄倒數開始的時間

let answered = false;      // 是否已作答
let answerResult = "";     // 答對/答錯訊息
let answerShowTime = 0;    // 顯示訊息的開始時間

let showRestartBtn = false; // 新增全域變數

let fireworks = []; // 全域變數

function preload() {
  iansuiFont = loadFont('Iansui-Regular.ttf'); // 正確載入字型
  handPose = ml5.handPose({maxHands: 1, flipped: true});
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  engine = Engine.create();
  bridge = new Bridge(num, radius, length);

  setupCircles();
  nextQuestion(); // 初始化時也要倒數
}

// 產生新題目的球
function setupCircles() {
  circles = [];
  let opts = ["A", "B", "C", "D", "E"];
  let colorPalette = ["#809bce", "#95b8d1", "#b8e0d2", "#d6eadf", "#eac4d5"];
  let shuffledColors = shuffle(colorPalette); // p5.js 的 shuffle 會隨機排列陣列
  for (let i = 0; i < opts.length; i++) {
    let x = random(40, width - 40);
    let y = random(40, height - 40);
    circles.push(new Circle(opts[i], bridge, x, y, shuffledColors[i]));
  }
}

function nextQuestion() {
  countdown = 3; // 3秒倒數
  countdownStartTime = millis();
  answered = false;
  answerResult = "";
}

function draw() {
  background(220);

  // 讓物理引擎每幀多跑幾次，讓橋和球反應更快與更精準
  for (let i = 0; i < 5; i++) {
    Engine.update(engine);
  }
  strokeWeight(2);
  stroke(0);

  // 先畫鏡頭畫面
  image(video, 0, 0, width, height);

  // 顯示題目與選項的白色背景框
  fill(255);
  noStroke();
  let questionHeight = 30 + 5 * 25;
  rect(5, 15, 620, questionHeight + 10, 10); // 框框

  // 框內右下角顯示分數
  fill(50, 100, 200);
  textFont(iansuiFont);
  textSize(24);
  textAlign(RIGHT, BOTTOM);
  text("得分：" + score + " / 100", 615, questionHeight + 15);

  // 顯示題目與選項
  fill(0);
  textFont(iansuiFont);
  textSize(20);
  textAlign(LEFT, TOP);
  if (currentQuestion < questions.length) {
    text(questions[currentQuestion].q, 15, 20);
    textSize(16);
    for (let i = 0; i < 5; i++) {
      text(questions[currentQuestion].options[i], 15, 50 + i * 25);
    }
  } else {
    textSize(32);
    text("遊戲結束！總得分：" + score, 15, 100);

    // 顯示再玩一次按鈕
    showRestartBtn = true;
    drawRestartButton();

    // 放煙火（只在100分時）
    if (score === 100) {
      if (frameCount % 15 === 0) launchFirework(); // 每隔幾幀發射一組
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        if (fireworks[i].isDead()) fireworks.splice(i, 1);
      }
    }
    return;
  }

  // 倒數狀態
  if (countdown > 0) {
    let elapsed = floor((millis() - countdownStartTime) / 1000);
    let remain = 3 - elapsed;
    fill(0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(remain > 0 ? remain : "開始！", width / 2, height / 2);

    if (remain <= 0) {
      countdown = 0;
      setupCircles(); // 倒數結束才掉球
    }
    return; // 不執行後續 draw
  }

  // 顯示答對/答錯訊息
  if (answered) {
    fill(answerResult === "答對！" ? "green" : "red");
    textSize(48);
    textAlign(CENTER, CENTER);
    text(answerResult, width / 2, height / 2);
    // 1秒後自動進入下一題
    if (millis() - answerShowTime > 1000) {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        nextQuestion();
      } else {
        launchFirework(); // 遊戲結束時觸發煙火
      }
    }
    return;
  }

  if (!answered && hands.length > 0) {
    let thumb = hands[0].keypoints[THUMB_TIP];
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    let bridgeWidth = dist(thumb.x, thumb.y, index.x, index.y);
    let bridgeThickness = 20; // 橋的判斷粗細，可自行調整

    for (let i = circles.length - 1; i >= 0; i--) {
      circles[i].checkActivate(bridge);
      circles[i].checkDone();
      circles[i].display();

      let ballPos = circles[i].body.position;

      // 計算球心到橋線段的最短距離
      let A = createVector(thumb.x, thumb.y);
      let B = createVector(index.x, index.y);
      let P = createVector(ballPos.x, ballPos.y);
      let AB = p5.Vector.sub(B, A);
      let AP = p5.Vector.sub(P, A);
      let t = constrain(AP.dot(AB) / AB.magSq(), 0, 1);
      let closest = p5.Vector.add(A, AB.mult(t));
      let distToBridge = p5.Vector.dist(P, closest);

      // 判斷：球心到橋線段的距離小於(橋厚度/2)，且球心投影在線段上
      if (distToBridge < bridgeThickness / 2) {
        answered = true;
        let isCorrect = circles[i].option.trim().toUpperCase() === questions[currentQuestion].answer.trim().toUpperCase();
        answerResult = isCorrect ? "答對！" : "答錯！";
        answerShowTime = millis();
        if (isCorrect) score += 20;
        circles[i].removeCircle();
        circles.splice(i, 1);
        break;
      }
    }
  }

  for (let i = circles.length - 1; i >= 0; i--) {
    circles[i].checkActivate(bridge);
    circles[i].checkDone();
    circles[i].display();

    if (circles[i].done) {
      circles[i].removeCircle();
      circles.splice(i, 1);
    }
  }

  if (hands.length > 0) {
    let thumb = hands[0].keypoints[THUMB_TIP];
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    fill(0, 255, 0);
    noStroke();
    circle(thumb.x, thumb.y, 10);
    circle(index.x, index.y, 10);

    // 設定橋兩端
    Body.setPosition(bridge.bodies[0], { x: thumb.x, y: thumb.y });
    Body.setPosition(bridge.bodies[bridge.bodies.length - 1], { x: index.x, y: index.y });

    // 讓所有中間點形成較深的弧線
    let n = bridge.bodies.length;
    for (let i = 1; i < n - 1; i++) {
      let t = i / (n - 1); // 0~1
      // 弧線公式，數字越大弧度越深
      let arc = (1 - Math.pow(2 * t - 1, 2)) * 60; // 60 可調整弧度深度
      let x = thumb.x + (index.x - thumb.x) * t;
      let y = thumb.y + (index.y - thumb.y) * t + arc;
      Body.setPosition(bridge.bodies[i], { x: x, y: y });
    }

    bridge.display();
  }

  // 顯示煙火
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].isDead()) {
      fireworks.splice(i, 1);
    }
  }
}

// 畫再玩一次按鈕
function drawRestartButton() {
  rectMode(CENTER);
  fill(50, 150, 255);
  stroke(0);
  rect(width / 2, height / 2 + 60, 180, 50, 15);
  fill(255);
  noStroke();
  textSize(28);
  textAlign(CENTER, CENTER);
  text("再玩一次", width / 2, height / 2 + 60);
  rectMode(CORNER);
}

// 滑鼠點擊事件
function mousePressed() {
  if (showRestartBtn) {
    // 判斷是否點到按鈕範圍
    let bx = width / 2, by = height / 2 + 60;
    if (mouseX > bx - 90 && mouseX < bx + 90 && mouseY > by - 25 && mouseY < by + 25) {
      restartGame();
    }
  }
}

// 重設遊戲
function restartGame() {
  score = 0;
  currentQuestion = 0;
  showRestartBtn = false;
  fireworks = []; // 清空煙火
  setupCircles();
  nextQuestion();
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

class FireworkParticle {
  constructor(x, y, color) {
    this.pos = createVector(x, y);
    let angle = random(TWO_PI);
    let speed = random(3, 7);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.acc = createVector(0, 0.1);
    this.lifetime = 255;
    this.color = color;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifetime -= 4;
  }
  show() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifetime);
    ellipse(this.pos.x, this.pos.y, 8);
  }
  isDead() {
    return this.lifetime < 0;
  }
}

function launchFirework() {
  let colors = [color("#809bce"), color("#95b8d1"), color("#b8e0d2"), color("#d6eadf"), color("#eac4d5")];
  let x = random(100, width - 100);
  let y = random(100, height / 2);
  for (let i = 0; i < 40; i++) {
    fireworks.push(new FireworkParticle(x, y, random(colors)));
  }
}

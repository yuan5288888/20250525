class Circle {
  constructor(option, bridge, x, y, color) {
    this.r = 30;
    this.option = option;
    this.color = color; // 新增顏色屬性
    let startY = bridge.bodies[0].position.y - 100;
    this.body = Bodies.circle(x || random(30, width - 30), y || startY, this.r, { 
      restitution: 0.6, 
      friction: 0.1,
      isStatic: false,
      frictionAir: 0.8
    });
    World.add(engine.world, this.body);
    this.done = false;
  }

  checkActivate(bridge) {
    let pos = this.body.position;
    let bridgeY = bridge.bodies[0].position.y;
    if (!this.activated && pos.y >= bridgeY) {
      Body.setStatic(this.body, false); // 讓球開始掉落
      this.activated = true;
    }
  }

  checkDone() {
    if (this.body.position.y - this.r > height) {
      // 讓球回到畫面上方隨機位置，繼續掉落
      let newX = random(this.r, width - this.r);
      let newY = -this.r;
      Body.setPosition(this.body, { x: newX, y: newY });
      Body.setVelocity(this.body, { x: random(-2, 2), y: random(2, 5) });
    }
  }

  display() {
    let pos = this.body.position;
    fill(this.color); // 使用指定顏色
    stroke(0);
    ellipse(pos.x, pos.y, this.r * 2);
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(this.option, pos.x, pos.y);
  }

  removeCircle() {
    World.remove(engine.world, this.body);
  }
}
class Player { 

  reverseDirection(direction) {
    if (direction == "backward") {
      return "forward"
    } else {
      return "backward"
    }
  }

  lookForward(warrior, direction) {
    // 第一步：返回前方看得到的所有空间
    // 注意：这里 warrior.look() 返回的是一个数组
    const spaces = warrior.look(direction);
    // 第二步：找到前方第一个上面有单位的空间：
    // 关于 find() 的用法，可以看这个文档：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    const spaceWithUnit = spaces.find(s => s.isUnit());
    // 第三步：如果找到了，返回这个空间上的单位
    // 【说明】注意这里的 && 的用法：只有左边条件为真时，才会执行右边的条件；
    // 也就是说，如果没有找到有单位，那么返回的是 undefined；如果找到了，调用 getUnit() 返回单元
    // Space API 的用法，可以查看文档：https://warrior.js.org/docs/en/player/space-api
    return spaceWithUnit && spaceWithUnit.getUnit(); 
  }

  /**
   * Plays a warrior turn.
   *
   * @param {Warrior} warrior The warrior.
   */
  playTurn(warrior) {
    // 方向
    const direction = this.direction || "forward";

    // 检测前方物体
    const feeling = warrior.feel(direction);
    const feltUnit = !feeling.isEmpty() && feeling.getUnit();
    const feltEnemy = feltUnit && feltUnit.isEnemy();
    const seenUnit = this.lookForward(warrior, direction);
    const sawEnemy = seenUnit && seenUnit.isEnemy();
    const hasCaptive = feltUnit && feltUnit.isBound();
    const hasWall = warrior.feel(direction).isWall();

    // 判断当前状态
    const isHeathy = warrior.health() === warrior.maxHealth();
    const isWeak = warrior.health() < warrior.maxHealth() / 2;
    const underAttack = warrior.health() < this.health;

    // 前方没有敌人，并且血量不够，而且没有受到攻击时，才休息
    if (hasWall) {
      warrior.think("撞墙了");
      this.direction = this.reverseDirection(direction);
      warrior.walk(this.direction);
    } else if (underAttack && isWeak) {
      warrior.think("后退");
      warrior.walk(this.reverseDirection(direction));
    } else if (!feltEnemy && !isHeathy && !underAttack) {
      warrior.think("休息");
      warrior.rest();
    } else if (hasCaptive) {
      warrior.think("解救人质");
      warrior.rescue(direction);
    } else if (sawEnemy) {
      warrior.think("射击");
      warrior.shoot(direction);
    } else if (feltEnemy) {
      warrior.think("攻击");
      warrior.attack(direction);
    } else {
      warrior.think("向前走");
      warrior.walk(direction);
    }

    // 记录我这一回合的血量
    this.health = warrior.health();
  }

}

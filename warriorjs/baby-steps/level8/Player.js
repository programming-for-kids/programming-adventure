class Player { 

  reverseDirection(direction) {
    if (direction == "backward") {
      return "forward"
    } else {
      return "backward"
    }
  }

  lookForward(warrior, direction) {
    // 前方看得到的所有空间
    const spaces = warrior.look(direction);
    // 找到前方第一个上面有单位的空间
    const spaceWithUnit = spaces.find(s => s.isUnit());
    // 如果找到了，返回第一个单位
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
    const hasUnit = !feeling.isEmpty();
    const unit = hasUnit && feeling.getUnit();
    const feltEnemy = unit && unit.isEnemy();
    const seenUnit = this.lookForward(warrior, direction);
    const sawEnemy = seenUnit && seenUnit.isEnemy();
    const hasCaptive = unit && unit.isBound();
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

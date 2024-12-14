class Observer {
    update(data) {
        throw new Error("Метод 'update' должен быть реализован");
    }
}

class Game {
    constructor() {
        this.level = 1;
        this.clickCount = 0;
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer.update({ clickCount: this.clickCount, level: this.level }));
    }

    click() {
        this.incrementClicks();
        this.notifyObservers();
    }

    incrementClicks() {
        this.clickCount += 500;
    }

    decrementClicks(count = 1) {
        this.clickCount -= count;
        this.notifyObservers();
    }
}

class ClickCounterDisplay extends Observer {
    constructor(elementId) {
        super();
        this.element = document.getElementById(elementId);
    }

    update({clickCount}) {
        this.element.textContent = `Кликов: ${clickCount}`;
    }
}

class BonusSystem extends Observer {
    constructor(elementId) {
        super();
        this.element = document.getElementById(elementId);
    }

    update({clickCount, level}) {
        if (clickCount % 10 === 0 && clickCount !== 0) {
            this.element.textContent = `🎉 Бонус за 10 кликов! +${level} кликов!`;
            const bonusEvent = new CustomEvent('addBonusClicks', {
              detail: { bonusClicks: level }
            });
            document.body.dispatchEvent(bonusEvent);
          } else {
            this.element.textContent = '';
          }
    }
}

class LevelDisplay extends Observer {
    constructor(elementId) {
      super();
      this.element = document.getElementById(elementId);
    }

    update({level}) {
      this.element.textContent = `Уровень: ${level}`;
      if (level === 4) {
        const clickButton = document.getElementById('click-button');
        clickButton.textContent = 'Победа!';
        clickButton.classList.add('win');
      }
    }
}

class UpgradeSystem extends Observer {
    constructor(containerId) {
      super();
      this.container = document.getElementById(containerId);
      this.upgrades = Array.from(this.container.querySelectorAll('.upgrade-locked'));
      this.upgrades.forEach(upgrade => {
        upgrade.addEventListener('click', () => this.handleUpgradeClick(upgrade));
      });
    }

    handleUpgradeClick(upgrade) {
      const requiredClicks = parseInt(upgrade.getAttribute('data-unlock-clicks'), 10);
      if (upgrade.classList.contains('upgrade-unlocked')) {
        return;
      }
      const unlockEvent = new CustomEvent('unlockUpgrade', {
        detail: {
          upgrade,
          requiredClicks
        }
      });
      document.body.dispatchEvent(unlockEvent);
    }

    update() {
    }
  }

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();

    const clickCounterDisplay = new ClickCounterDisplay('click-counter');
    const bonusSystem = new BonusSystem('bonus-message');
    const levelDisplay = new LevelDisplay('level-display');
    const upgradeSystem = new UpgradeSystem('upgrade-container');

    game.subscribe(clickCounterDisplay);
    game.subscribe(bonusSystem);
    game.subscribe(levelDisplay);
    game.subscribe(upgradeSystem);

    const clickButton = document.getElementById('click-button');
    clickButton.addEventListener('click', () => game.click());

    document.body.addEventListener('addBonusClicks', (event) => {
        const { bonusClicks } = event.detail;
        game.incrementClicks(bonusClicks);
    });

    document.body.addEventListener('unlockUpgrade', (event) => {
        const { requiredClicks, upgrade } = event.detail;
        if (game.clickCount < requiredClicks) {
          return;
        }
        upgrade.classList.add('upgrade-unlocked');
        upgrade.classList.remove('upgrade-locked');
        game.level++;
        game.decrementClicks(requiredClicks);
    });
});

import {Component, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import * as moment from "moment";



enum EMoveDirection {
  FROM_UP = 'fromUp',
  FROM_DOWN = 'fromDown',
  FROM_LEFT = 'fromLeft',
  FROM_RIGHT = 'fromRight',
}

interface IMove {
  dir: EMoveDirection,
  diff: { x: number, y: number }
}

interface IPoint {
  x: number;
  y: number;
  dir?: EMoveDirection;
}

interface ILastMove {
  cell: number;
  from?: EMoveDirection
}

const moveList: IMove[] = [
  {dir: EMoveDirection.FROM_UP, diff: {x: 0, y: 1}},
  {dir: EMoveDirection.FROM_DOWN, diff: {x: 0, y: -1}},
  {dir: EMoveDirection.FROM_LEFT, diff: {x: -1, y: 0}},
  {dir: EMoveDirection.FROM_RIGHT, diff: {x: 1, y: 0}},
]

@Component({
  selector: 'app-root',
  animations: [
    trigger('move',
      moveList.map(move => {
          const movableAxis = move.diff.x === 0 ? 'y' : 'x';
          const movableDirection = move.diff[movableAxis] < 0 ? '-' : '';
          return transition(`void => ${move.dir}`,
            [style({transform: `translate${movableAxis.toUpperCase()}(${movableDirection}100%)`}), animate('0.2s')])
        }
      )
      //   [
      //   transition('void => fromUp', [style({transform: 'translateY(100%)'}), animate('0.2s')]),
      //   transition('void => fromDown', [style({transform: 'translateY(-100%)'}), animate('0.2s')]),
      //   transition('void => fromLeft', [style({transform: 'translateX(-100%)'}), animate('0.2s')]),
      //   transition('void => fromRight', [style({transform: 'translateX(100%)'}), animate('0.2s')])
      // ]
    ),
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']

})

export class AppComponent implements OnInit {
  private _fieldSize = 4;
  state: any[] = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
  ]
  stateStart: any[] = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
  ]
  gameStatus = false
  lastMove: ILastMove = {
    cell: 0,
    from: undefined
  }
  counter = {minute: 0, seconds: 0}
  time = moment(this.counter).format('mm:ss')
  moves = 0;
  timerStatus = false

  ngOnInit(): void {
    this.shuffle()
  }

  resetGame() {
    this.shuffle()
  }

  trackBy(index, item) {
    return `i${index}_cell${item}`
  }

  move({y, x}) {
    const emptyCell = this.findEmptyCell();
    const isMovable = this.getMovableCellList().find(c => c.x === x && c.y === y);
    if (!isMovable) return;

    this.lastMove.cell = this.state[y][x];
    if (this.gameStatus) {
      this.lastMove.from = isMovable.dir;
    }

    if (this.isInField(x, y) && this.gameStatus) {
      this.moves += 1
      if (this.moves === 1) {
        this.timerStatus = true
        this.timer()
      }
    }

    this.state[emptyCell.y][emptyCell.x] = this.state[y][x];
    this.state[y][x] = 0;

    if (JSON.stringify(this.state) === JSON.stringify(this.stateStart) && this.gameStatus) {
      alert(`Вы победили!!! Время: ${this.time}, Ходы: ${this.moves}`)
      this.gameStatus = false
    }
  }

  shuffle() {
    this.gameStatus = false
    this.timerStatus = false
    for (let i = 1; i < 2000; i++) {
      let moveCells = this.getMovableCellList()
      let rand = Math.floor(Math.random() * moveCells.length)
      this.move(moveCells[rand]);
    }
    this.gameStatus=true
  }

  getMovableCellList(): IPoint[] {
    const empty = this.findEmptyCell();
    return moveList
      .map(move => ({x: empty.x + move.diff.x, y: empty.y + move.diff.y, dir: move.dir}))
      .filter(m => this.isInField(m.x, m.y));
  }

  findEmptyCell(): IPoint {
    let cell: IPoint = {x: 0, y: 0};
    this.state.forEach((valueY, y) => {
      valueY.forEach((valueX, x) => {
        if (valueX == 0) cell = {x, y};
      })
    })
    return cell
  }

  isInField(x, y) {
    return x < this._fieldSize && x >= 0 && y < this._fieldSize && y >= 0
  }

  timer() {
    if (this.timerStatus) {
      let timerId = setInterval(() => {
        this.counter.seconds += 1
        if (this.counter.seconds == 60) {
          this.counter.minute += 1
          this.counter.seconds = 0
        }
        if (!this.gameStatus || !this.timerStatus) {
          this.timerStatus = false
          clearInterval(timerId)
          this.counter = {minute: 0, seconds: 0}
          this.moves= 0
        }
        this.time = moment(this.counter).format('mm:ss')
      }, 1000)
    }

  }
}

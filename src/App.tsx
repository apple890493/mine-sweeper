import { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import "./App.css";

interface Tile {
  x: number;
  y: number;
  isMine: boolean;
  isShow: boolean;
  isMarked: boolean;
  text: string;
}

interface Mine {
  x: number;
  y: number;
}

function App() {
  const [tiles, setTiles] = useState<Tile[][]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const WIDTH = 12;
  const HEIGHT = 10;
  const MINE_COUNT = 20;
  const markCountRef = useRef<number>(0)
  const markedMineCountRef = useRef<number>(0)

  const initTiles = () => {
    const colList: Tile[][] = [];
    for (let y = 0; y < HEIGHT; y++) {
      const rowList: Tile[] = [];
      for (let x = 0; x < WIDTH; x++) {
        rowList.push({
          x,
          y,
          isMine: false,
          isShow: false,
          isMarked: false,
          text: ''
        });
      }
      colList.push(rowList);
    }
    setTiles(colList);
  };

  const initMine = () => {
    const mineList: Mine[] = []
    while (mineList.length < MINE_COUNT) {
      const x = Math.floor(Math.random() * WIDTH);
      const y = Math.floor(Math.random() * HEIGHT);
      const isMineExisting = mineList.some(
        (mine) => mine.x === x && mine.y === y
      );
      if (!isMineExisting) {
        setTiles((tiles) => {
          const newTiles = [...tiles]
          newTiles[y][x].isMine = true
          return newTiles
        })
        mineList.push({ y, x })
      }
    }
    setMines(mineList)
  };

  const onClick = (tile: Tile) => {
    const { x, y } = tile
    if(tile.isShow || tile.isMarked) return

    if(tile.isMine) return alert('you lose')
    const newTiles = [...tiles];
    newTiles[y][x].isShow = true

    if(markedMineCountRef.current === MINE_COUNT && markCountRef.current === MINE_COUNT ) {
      alert('you win')
    } 

    const nearByTiles = getNearByTiles(tile)
    const mineCount = nearByTiles.filter(tile => tile.isMine).length

    if(mineCount === 0) {
      nearByTiles.forEach((nearBy) => onClick(nearBy))
    } else {
      newTiles[y][x].text = mineCount.toString()
      setTiles(newTiles)
    }
  }

  const getNearByTiles = (tile: Tile): Tile[] => {
    const tileList: Tile[] = []
    for(let yOffset = -1; yOffset <= 1; yOffset++) {
      for(let xOffset = -1; xOffset <= 1; xOffset++) {
        const nearByTile = tiles[tile.y + yOffset]?.[tile.x + xOffset]
        if(nearByTile && !nearByTile.isShow && !positionMatch(nearByTile, tile)) {
          tileList.push(nearByTile)
        }
      }
    }
    return tileList
  }

  const positionMatch = (currentTile: Tile, compareTile: Tile): boolean => {
    return currentTile.x === compareTile.x && currentTile.y === compareTile.y
  }
  
  const onRightClick = (tile: Tile ) => {
    const { x, y } = tile

    const newTiles = JSON.parse(JSON.stringify(tiles))
    newTiles[y][x].isMarked = !newTiles[y][x].isMarked
    markCountRef.current = newTiles[y][x].isMarked ? markCountRef.current += 1 : markCountRef.current -= 1
    const isMarkedMine = mines.some((mine) => (mine.x === x  && mine.y === y))
    if(isMarkedMine) {
      markedMineCountRef.current += 1
    }
    if(markedMineCountRef.current === MINE_COUNT && markCountRef.current === MINE_COUNT ) {
      alert('you win')
    }

    setTiles(newTiles)
  }

  useEffect(() => {
    initTiles();
    initMine();
  }, []);

  return (
    <div className="p-10 flex flex-col">
      {tiles.map((rowList, index) => (
        <div className="flex" key={`row-${index}`}>
          {rowList.map((tile) => {
            const { x, y, isMine, isShow, isMarked, text } = tile
            return (
            <div
              className={classnames('w-10 h-10 border border-gray-950 ', {
                'bg-purple-300': isMarked && !isShow,
                'bg-zinc-300': !isShow && !isMarked,
                'bg-yellow-300': isShow && !isMine,
                'bg-red-300': isMine && !isMarked,
              })}
              key={`tile-${x}-${y}`}
              onClick={() => onClick(tile)}
              onContextMenu={(event) => {
                event.preventDefault()
                if(isShow) return
                onRightClick(tile)
              }}
            >{text}</div>
          )})}
        </div>
      ))}
    </div>
  );
}

export default App;

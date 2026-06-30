export type TileAnimationData = Array<{ duration: number, tileid: number }>;

export class DestructableTile {
  private tile: Phaser.Tilemaps.Tile;
  public lives: number = 2;
  public tweenIndex: number = -1;

  constructor(tile: Phaser.Tilemaps.Tile) {
    this.tile = tile;
  }

  hit(strength: number) {
    this.lives -= strength;
    if (this.lives <= 0) {
      this.tile.setVisible(false);
      this.tile.setCollision(false, false, false, false);
    }
  }
}

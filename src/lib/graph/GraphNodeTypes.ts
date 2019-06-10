import * as Vec2D from 'vector2d'
import { IGeoCoordinate } from './GeoCoordinate'

class GraphNode {
    public index:number;
    constructor(idx: number) {
        this.index = idx
    }
}

class NavGraphNode extends GraphNode {
    public position:Vec2D.Vector

    constructor(idx: number, pos: Vec2D.Vector) {
        super(idx)
        this.position = pos
    }
}

class GeoGraphNode extends GraphNode {
    public location:IGeoCoordinate

    constructor(idx:number, location: IGeoCoordinate) {
        super(idx)
        this.location = location
    }
}

export { GraphNode, NavGraphNode, GeoGraphNode }
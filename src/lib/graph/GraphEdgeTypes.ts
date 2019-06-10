import { IComparable } from '../misc/IComparable';

class GraphEdge implements IComparable<GraphEdge> {

    public from:number
    public to:number

    public cost: number

    constructor(f: number, t: number, c: number) {
        this.from = f
        this.to = t
        this.cost = c
    }

    isEqual(to: GraphEdge): boolean {
        return to.from === this.from &&
                to.to == this.to &&
                to.cost == this.cost
    }
}

class NavGraphEdge extends GraphEdge {
    constructor(f: number, t: number, c: number) {
        super(f, t, c)
    }
}

class GeoGraphEdge extends GraphEdge {
    constructor(from:number, to:number, cost:number) {
        super(from, to, cost)
    }
}

export { GraphEdge, NavGraphEdge, GeoGraphEdge }
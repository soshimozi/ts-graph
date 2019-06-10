
import * as R from "ramda";
const assert = require('assert');

class IndexedPriorityQLow<TKey> {
    private m_vecKeys: TKey[];
    private m_Heap: number[];
    private m_invHeap: number[];
    private m_iSize:number;
    private m_iMaxSize:number;

    private swap(a:number, b:number) :void {
        const temp = this.m_Heap[a];
        this.m_Heap[a] = this.m_Heap[b];
        this.m_Heap[b] = temp;

        // chnage handles too
        this.m_invHeap[this.m_Heap[a]] = a; this.m_invHeap[this.m_Heap[b]] = b;
    }

    private reorderUpwards(nd: number) : void {
        //move up the heap swapping the elements until the heap is ordered
        while ( (nd>1) && (this.m_vecKeys[this.m_Heap[nd/2]] > this.m_vecKeys[this.m_Heap[nd]]) ) {      
            this.swap(nd/2, nd);
            nd /= 2;
        }
    
    }

    private reorderDownwards(nd : number, HeapSize : number) : void {
        //move down the heap from node nd swapping the elements until
        //the heap is reordered
        while (2*nd <= HeapSize) {
            let child = 2 * nd;

            //set child to smaller of nd's two children
            if ((child < HeapSize) && (this.m_vecKeys[this.m_Heap[child]] > this.m_vecKeys[this.m_Heap[child+1]])) {
                ++child;
            }

            //if this nd is larger than its child, swap
            if (this.m_vecKeys[this.m_Heap[nd]] > this.m_vecKeys[this.m_Heap[child]]) {
                this.swap(child, nd);

                //move the current node down the tree
                nd = child;
            } else {
                break;
            }
        }
    }

    constructor(keys:TKey[], MaxSize:number) {
        this.m_iSize = 0;
        this.m_iMaxSize = MaxSize;

        this.m_Heap = R.repeat(0, MaxSize)
        this.m_invHeap = R.repeat(0, MaxSize)

        this.m_vecKeys = keys;
    }

    empty():boolean {
        return this.m_iSize == 0;
    }

    //to insert an item into the queue it gets added to the end of the heap
    //and then the heap is reordered from the bottom up.
    insert(idx:number): void {
        assert (this.m_iSize+1 <= this.m_iMaxSize);

        this.m_iSize++;

        this.m_Heap[this.m_iSize] = idx;

        this.m_invHeap[idx] = this.m_iSize;

        this.reorderUpwards(this.m_iSize);
    } 
    
    //to get the min item the first element is exchanged with the lowest
    //in the heap and then the heap is reordered from the top down. 
    Pop():number {
        this.swap(1, this.m_iSize);

        this.reorderDownwards(1, this.m_iSize-1);

        return this.m_Heap[this.m_iSize--];
    }

    //if the value of one of the client key's changes then call this with 
    //the key's index to adjust the queue accordingly
    changePriority(idx:number):void {
        this.reorderUpwards(this.m_invHeap[idx]);
    }    
}

export { IndexedPriorityQLow };
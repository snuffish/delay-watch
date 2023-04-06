import Table from 'cli-table3'

export class CliTable {

    table: any

    constructor(head: string[]) {
        this.table = new Table({
            head,
            style: {
                border: []
            }
        })
    }

    public addRows(...rows: any[]): void {
        for (const row of rows) {
            this.table.push(row)
        }
    }

    public render = (): any => console.log(this.table.toString())
}
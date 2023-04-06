import { Request, Response } from 'express'

const DefaultController = (req: Request, res: Response) => {
    res.send(`
        <p><b>POST</b></p>
        <ul>
            <li>/scan</li>
        </ul>
        <p><b>GET</b></p>
        <ul>
            <li>/stations</li>
        </ul>
    `)
}

export default DefaultController
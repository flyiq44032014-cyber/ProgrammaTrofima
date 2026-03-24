import  express from 'express'
import photosRouter from "./routes/photos.js";


const app = express()
const port = 3000

app.use(express.json());
app.use("/api/photos/", photosRouter);

app.get('/', (req, res) => {
    res.send('скоро тут будут фоточки ')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
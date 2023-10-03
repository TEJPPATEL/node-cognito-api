const express = require('express');
const app = express();
const authController = require('./authController');
const auth = require('./middlewares/authMiddleware');
const authRoute = require('./routes/authRoute');


app.use(express.json());

app.use('/auth', authRoute);

app.get("/welcome", auth.validateToken, (req, res) => {
    return res.status(200).json({ message: "Welcome !! Thank you" });
})

app.use((req, res, next) => {
    console.log("Calllled index");
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    if (err) {
        res
            .status(err.status || 500)
            .json({ error: { message: err.message || "Internal Server Error" } });
    }
});



const PORT = 8080 || process.env.PORT;
app.listen(PORT, () => {
    console.log("App Running on PORT::" + PORT)
},)
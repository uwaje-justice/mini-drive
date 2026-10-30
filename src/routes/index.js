import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", { message: "welcome to my mini drive!!!" });
});

export default router;

import asyncHandler from "express-async-handler";
import EmailSender from "~/middleware/mailMiddleware";

const sendContact = asyncHandler(async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    EmailSender({ name, email, subject, message });
    res.json({ msg: "Bạn đã gửi tin nhắn thành công" });
  } catch (err) {
    res.status(404).json({ msg: "Error to get data" });
  }
});

export const contactController = { sendContact };

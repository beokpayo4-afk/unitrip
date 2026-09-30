import GlobalFaq from "../models/GlobalFaq.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";

export const listFaqs = asyncHandler(async (req, res) => {
  const faqs = await GlobalFaq.find().sort({ sortOrder: 1, createdAt: 1 });
  res.json(faqs);
});

export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, sortOrder } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: "question and answer are required" });
  }
  const faq = await GlobalFaq.create({
    question,
    answer,
    sortOrder: sortOrder ?? 0,
  });

  await audit({
    level: "info",
    action: "faq.create",
    message: `FAQ created: "${faq.question}"`,
    meta: { faqId: String(faq._id), sortOrder: faq.sortOrder },
    actor: req.user,
  });

  res.status(201).json(faq);
});

export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await GlobalFaq.findById(req.params.id);
  if (!faq) {
    return res.status(404).json({ message: "FAQ not found" });
  }
  const { question, answer, sortOrder } = req.body;
  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (sortOrder !== undefined) faq.sortOrder = sortOrder;
  await faq.save();

  await audit({
    level: "info",
    action: "faq.update",
    message: `FAQ updated: "${faq.question}"`,
    meta: { faqId: String(faq._id), sortOrder: faq.sortOrder },
    actor: req.user,
  });

  res.json(faq);
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await GlobalFaq.findById(req.params.id);
  if (!faq) {
    return res.status(404).json({ message: "FAQ not found" });
  }
  const question = faq.question;
  const id = String(faq._id);
  await faq.deleteOne();

  await audit({
    level: "warn",
    action: "faq.delete",
    message: `FAQ deleted: "${question}"`,
    meta: { faqId: id },
    actor: req.user,
  });

  res.json({ message: "FAQ deleted" });
});

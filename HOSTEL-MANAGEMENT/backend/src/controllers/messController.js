import { MealPlan } from '../models/MealPlan.js';
import { MealRSVP } from '../models/MealRSVP.js';

export async function upsertMealPlan(req, res) {
  const body = req.body || {};
  if (!body.date) return res.status(400).json({ message: 'date required' });
  const date = new Date(body.date);
  const doc = await MealPlan.findOneAndUpdate(
    { date: new Date(date.getFullYear(), date.getMonth(), date.getDate()) },
    { $set: { meals: body.meals || {}, coupons: body.coupons || [] } },
    { new: true, upsert: true }
  );
  res.json(doc);
}

export async function getMealPlan(req, res) {
  const d = req.query.date ? new Date(req.query.date) : new Date();
  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const plan = await MealPlan.findOne({ date: key }).lean();
  res.json(plan || { date: key, meals: { breakfast: '', lunch: '', dinner: '' }, coupons: [] });
}

export async function setRSVP(req, res) {
  const body = req.body || {};
  const d = body.date ? new Date(body.date) : new Date();
  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const doc = await MealRSVP.findOneAndUpdate(
    { user: req.user._id, date: key },
    { $set: { breakfast: !!body.breakfast, lunch: !!body.lunch, dinner: !!body.dinner, rebate: !!body.rebate } },
    { new: true, upsert: true }
  );
  res.json(doc);
}

export async function getMyRSVP(req, res) {
  const d = req.query.date ? new Date(req.query.date) : new Date();
  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const doc = await MealRSVP.findOne({ user: req.user._id, date: key }).lean();
  res.json(doc || { user: req.user._id, date: key, breakfast: true, lunch: true, dinner: true, rebate: false });
}

export async function headcount(req, res) {
  const d = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const agg = await MealRSVP.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    { $group: { _id: null, breakfast: { $sum: { $cond: ['$breakfast', 1, 0] } }, lunch: { $sum: { $cond: ['$lunch', 1, 0] } }, dinner: { $sum: { $cond: ['$dinner', 1, 0] } } } },
  ]);
  res.json(agg[0] || { breakfast: 0, lunch: 0, dinner: 0 });
}

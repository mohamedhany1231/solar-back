const asyncCatch = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIfeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("no document found with that id ", 404));
    }

    //  204 =  no content
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // to return the updated tour
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("no document found with that id ", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });

exports.createOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncCatch(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("no document found with that id ", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });

exports.getAll = (Model) =>
  asyncCatch(async (req, res, next) => {
    let filter = req.params;
    if (!req.query.limit) req.query.limit = 10;
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const countQuery = Model.countDocuments();

    const [docs, pages] = await Promise.all([features.query, countQuery]);

    res.status(200).json({
      status: "success",
      requestAt: req.requestedTime,
      result: docs.length,
      data: {
        [Model.modelName.toLowerCase() + "s"]: docs,

        pagesCount: Math.ceil(pages / req.query.limit),
      },
    });
  });

// const Tour = require('../models/tourModel');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1-filtering
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    // 1.2 - advanced filter

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr)); //.find() return a query

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replaceAll(',', ' ');
      this.query.sort(sortBy);
    } else {
      this.query.sort('-createdAt -ratingAverage');
    }

    return this;
  }

  limitFields() {
    // 3- field assigning (also known as the query "projection")
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replaceAll(',', ' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    //  4 - pagination
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;

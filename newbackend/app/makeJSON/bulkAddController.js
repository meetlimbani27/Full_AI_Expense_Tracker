// app/makeJSON/bulkAddController.js
import bulkAddService from "./bulkAddService.js";

const bulkAddController = {};

bulkAddController.bulkAdd = async (req, res, next) => {
  console.log("bulkAddController controller hit");
  console.log(req.body.expense);

  const data = req.body.expense;
  if (!data) {
    return res.status(400).json({ error: "Data field is not provided." });
  } else if (data === "start") {
    const result = await bulkAddService.makeAddJSON();
    res.status(200).json(result);
  }

  // sending the expense to the service
  // try {
  //     console.log('sending data to bulkAddService');
  //     const result = await bulkAddService.bulkAdd(data);
  //     res.status(200).json(result);

  // } catch (error) {
  //     console.error('Error in bulkAdd:', error);
  //     next(error); // Pass to error handling middleware
  // }
};

export default bulkAddController;

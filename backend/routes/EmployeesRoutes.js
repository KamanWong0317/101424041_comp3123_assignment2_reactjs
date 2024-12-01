// exported
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const empModel = require('../models/EmployeesModel');

// Retrieve all employee list
router.get('/employees', async(req, res) => {
    const emp = await empModel.find();
    try{
        if(emp == ""){
            return res.status(200).send({ 
                message: "Employee list is empty!"
            })
        }
        return res.status(200).send({emp});
    }catch(err){
        console.error('Error fetching employee:', err);
        return res.status(500).send({
            status: false,
            message: "Error reading the employee data"
        });
    }
});

// create new employee
router.post('/employees', async(req, res) => {
     // Validate request
     await Promise.all([
        validate_input('first_name',req),
        validate_input('last_name',req),
        validate_input('email',req),
        validate_input('position',req),
        validate_input('salary',req),
        validate_input('date_of_joining',req),
        validate_input('department',req)
    ]);
    // validation errors
    const errors = await validationResult(req);
    if(!errors.isEmpty()){return res.status(400).json({errors: errors.array()});}

    const { first_name, last_name, email, position, salary, date_of_joining, department} = req.body;
    // Check the employee already exists
    if(await empModel.findOne({email: email})){
        return res.status(409).json({ status: false, message: 'Employee is already added' });
    };

    // cerate employee to mongodb 
    try{
        const emp = new empModel({
            first_name: first_name,
            last_name: last_name,
            email: email,
            position: position,
            salary: salary,
            date_of_joining: date_of_joining,
            department: department,
            created_at: new Date(), 
            updated_at: new Date()
        });
        await emp.save();
        console.log("created new employee");
        return res.status(201).send({ 
            message: "Employee created successfully.",
            employee_id: emp._id
         });
    }catch(err){
        console.error('Error create rmployee:', err);
        return res.status(500).send({
            status: false,
            message: "Create employee invalidation "
        });
    }
})

// get employee details by employee id
router.get('/employees/:eid', async(req, res) => {
    try{
        const eid = req.params.eid;
        const emp = await empModel.findById(eid);
        if(!emp){
                return res.status(404).json({ 
                status: false, 
                message: "Employee not find"});
        }
        return res.status(200).send({emp});
    }catch(err){
        console.error('Error fetching employee:', err);
        return res.status(400).send({
            status: false,
            message: "Employee ID is invalid"
        });
    }
})

// update employee details
router.put('/employees/:eid', async(req, res) => {
    const eid = req.params.eid
    // check employee id
    const emp = await empModel.findByIdAndUpdate(eid, req.body);
    if (!emp){return res.status(404).json({status: false, message: "Employee ID not find"})};

    try{
        // update updated_at data
        emp.updated_at = await new Date();
        await emp.save();
        console.log('Successfully Update employee')
        return res.status(200).json({ 
            message: "Employee details updated successfully"
        });
    }catch(err){
        console.error('Error update employee:', err);
        return res.status(500).send({
            status: false,
            message: "Update employee invalidation"
        });
    }                
})

// delete employee by id
router.delete('/employees', async(req, res)=>{
    try{
        const eid = req.query.eid;
        if(!eid){
            return res.status(400).json({
                status: false,
                message: "Employee id is required"
            });
        }
        const emp = await empModel.findByIdAndDelete(eid);
        if(!emp){
            return res.status(404).json({
                status: false,
                message: "Employee not find"
            });
        };
        console.log('Successfully Delete')
        return res.status(200).json({ 
            message: "Employee delete successfully"
        });
    }catch(err){
        console.error('Error delete employee:', err);
        return res.status(500).send({
            status: false,
            message: "Delete employee invalidation"
        });
    }
});

// Search employees by department/position
router.get('/employees/search/:text', async (req, res) => {
    try {
        const text = req.params.text;

        const employees = await empModel.find({
            $or: [
                { department: text },
                { position: text }
            ]
        });
        
        if (employees.length === 0) {
            return res.status(404).json({ 
                status: false, 
                message: "No employees found matching the criteria"
            });
        }
        return res.status(200).json({ status: true, employees });
    } catch (err) {
        console.error('Error searching employees:', err);
        return res.status(500).send({
            status: false,
            message: "Error searching employees"
        });
    }
});


// Export the router
module.exports = router;

// function for check requests
function validate_input(input, req){
    switch (input) {
        case 'first_name':
            return body('first_name').notEmpty().withMessage('First name is required').run(req);
        case 'last_name':
            return body('last_name').notEmpty().withMessage('Last name is required').run(req);
        case 'email':
            return body('email').isEmail().withMessage('Please provide a valid email address').run(req);
        case 'position':
            return body('position').notEmpty().withMessage('Position is required').run(req);
        case 'salary':
            return body('salary').isNumeric().withMessage('Enter salary in number')
        case 'date_of_joining':
            return body('department').notEmpty().withMessage('Joining date is required')
            .isISO8601().withMessage('Please provide a valid date format (YYYY-MM-DDTHH:mm:ss.sssZ)');
        case 'department':
            return body('department').notEmpty().withMessage('Department is required').run(req);
        default:
            break;
    } 
}
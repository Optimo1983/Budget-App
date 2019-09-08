// BUDGET CONTROLLER
// ========================================================
var budgetController = (function(){

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };


    var data = {
        items: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.items[type].forEach(function(current) {
            sum = sum + current.value; 
        });

        data.totals[type] = sum;
    };

    var calculatePercentage = function() {

        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
    }

    return {

        addItem: function(obj) {
            var newID, newItem;

            if (data.items[obj.type].length > 0) {
                newID = (data.items[obj.type][data.items[obj.type].length - 1].id) + 1
            } else {
                newID = 0;
            }

            if (obj.type === 'inc') {
                newItem = new Income(newID, obj.description, obj.value)
            } else if (obj.type === 'exp') {
                newItem = new Expense(newID, obj.description, obj.value)
            }
            
            data.items[obj.type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            var IDs, idIndex;

            IDs = data.items[type].map(function(current) {
                return current.id;
            });

            idIndex = IDs.indexOf(id);

            if (idIndex !== -1) {
                data.items[type].splice(idIndex, 1);
            }
        },

        updateBudget: function() {
            // Calculate totals
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate budget: total income - total expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate total expenses percentage
            calculatePercentage();
        },

        getBudget: function() {
            return {
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            };
        },

        calcExpPerc: function() {
            // Calculate the percentage of each expense item and place into new array
            var expPercArray = data.items.exp.map(function(current) {
                current.calcPercentage(data.totals.inc);

                return current.percentage;
            });
            
            return expPercArray;
        },

        getData: function() {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
// ========================================================
var UIController = (function() {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        expItemPercentage: '.item__percentage',
        itemListContainer: '.container',
        dateLabel: '.budget__title--month'
    };

    var nodeListForEach = function(list, callback) {
        for (i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var currencyFormat = function(num) {
        return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    };

    return {

        getDOMStrings: function() {
            return domStrings;
        },

        getInputs: function() {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },

        clearFields: function() {
            var fields;
            
            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            
            nodeListForEach(fields, function(current){
                 current.value = "";
            });

            document.querySelector(domStrings.inputDescription).focus();
        },

        displayListItem: function(obj, type) {
            var field, html, newHtml;

            if (type === 'inc') {

                field = document.querySelector(domStrings.incomeList);
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp') {

                field = document.querySelector(domStrings.expensesList);
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', currencyFormat(obj.value));

            field.insertAdjacentHTML('beforeend', newHtml);
        },

        removeListItem: function(elementID) {
            var htmlElement = document.getElementById(elementID);

            htmlElement.parentNode.removeChild(htmlElement);
        },

        displayBudget: function(obj) {
            document.querySelector(domStrings.incomeLabel).textContent = currencyFormat(obj.totalIncome);
            document.querySelector(domStrings.expensesLabel).textContent = currencyFormat(obj.totalExpenses);
            document.querySelector(domStrings.budgetLabel).textContent = currencyFormat(obj.budget);

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },

        displayExpPerc: function(arr) {

            var fields = document.querySelectorAll(domStrings.expItemPercentage);

            nodeListForEach(fields, function(current, index){
                
                if (arr[index] > 0) {
                    current.textContent = arr[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        changedType: function() {
            var htmlfields = document.querySelectorAll(
                domStrings.inputType + ',' + 
                domStrings.inputDescription + ',' + 
                domStrings.inputValue);

            nodeListForEach(htmlfields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },

        displayDate: function() {
            var currentDate, currentMonth, currentYear, monthNames;

            currentDate = new Date;
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();

            monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            console.log(currentDate, currentMonth, currentYear);

            document.querySelector(domStrings.dateLabel).textContent = monthNames[currentMonth] + ', ' + currentYear;


        }

    };
})();



// GLOBAL APP CONTROLLER
// ========================================================

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
                event.preventDefault();
            };
        });

        document.querySelector(DOM.itemListContainer).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var ctrlAddItem = function() {
        // Get inputs
        var input = UICtrl.getInputs();

        if (input.description != '' && !isNaN(input.value) && input.value > 0) {

            // Clear fields and reset focus
            UICtrl.clearFields();

            // Add inc/exp item to budget controller
            var itemObj = budgetCtrl.addItem(input);

            // Add inc/exp item to UI
            UICtrl.displayListItem(itemObj, input.type);

            // Update and display budget
            updateBudget();

            // Update and display exp item percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var htmlID, splitID, id, type;

        htmlID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        splitID = htmlID.split('-');
        type = splitID[0];
        id = parseInt(splitID[1]);

        if (event.target.classList.value === "ion-ios-close-outline" && htmlID) {
            // Remove target with itemID from UI
            UICtrl.removeListItem(htmlID);

            // Remove inc/exp item from data in budget controller
            budgetCtrl.deleteItem(type, id);

            // Update and display budget
            updateBudget();

            // Update and display exp item percentages
            updatePercentages();
        } 
    };

    var updateBudget = function() {
        // Calculate totals and budget
        budgetCtrl.updateBudget();

        // Get totals and budget
        var budget = budgetCtrl.getBudget();

        // Display totals and budget
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // Calculate exp item percentages
        var expPercentages = budgetCtrl.calcExpPerc();

        // Display exp item percentages
        UICtrl.displayExpPerc(expPercentages);
    }

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                totalIncome: 0,
                totalExpenses: 0,
                budget: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);

controller.init();
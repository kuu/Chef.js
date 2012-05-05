"use strict";

/* ----------------------------------------
 * Create and initialize a Chef object
 * This function takes an array containing Chef statements and returns an object that provides methods to execute the statements.
 * Clients just call the returned object's run() method to execute the statements, and then call getDiners() to get the results.
 * [params]
 * - lines: An array containing recipe lines. Each item holds a single Chef statement.
 * - offset: A number to specify the offset in the array. The execution will start from the offset line.
 * [return]
 * An object that contains closures.
 * ----------------------------------------
 */
function init(lines, offset)
{
	// Properties for cooking
	var recipeTitle = '';
	var ingredients = [];
	var mixingBowls = [];
	var bakingDishes = [];
	var diners = [];

	// Properties for internal state management
	var currentState = 'Discovering Recipe Title';
	var currentLine; // i.e. Program Counter
	var exitMainLoop = false;
	var loopStack = [];

	// Return an object containing closures
	return {

		/* ----------------------------------------
		 * Execute Chef statements
		 * This starts the main loop in which each statement is fetched and executed until the end of the recipe.
 		 * If the execution succeeded, its results will be available by calling getDiners() on the same object.
		 * Otherwise an exception will be reported with the information about which line of the statements the error occurred.
		 * ----------------------------------------
		 */
		run : function ()
		{
			// Main loop
			for (currentLine = offset; 
				currentLine < lines.length && !exitMainLoop; currentLine++)
			{
				// Control inner loops.
				if (loopStack.length > 0)
				{
					var loop = loopStack[loopStack.length - 1];
					if (loop.forceExit)
					{
							// Exit loop.
							currentLine = loop.end + 1;
							loopStack.pop();
							console.log('\t+++++ Loop exit!.');
					}
					else if (currentLine === loop.end)
					{
						if (loop.ingredientToCheck.value <= 0)
						{
							// Exit loop.
							currentLine = loop.end + 1;
							loopStack.pop();
							console.log('\t+++++ Loop exit!.');
						}
						else
						{
							if (loop.ingredientToDecrement)
							{
								loop.ingredientToDecrement.value--;
							}
							console.log('\t+++++ Loop continue... (' 
								+ loop.ingredientToCheck.value + ' remained)');
							currentLine = loop.start + 1;
						}
					}
				}

				// Invoke the state function.
				try
				{
					this[currentState](lines[currentLine]);
				}
				catch (e)
				{
					throw new Error('Error occurred at line ' + (currentLine + 1) + ' in your recipe. : ' + e.message);
				}
			}
		},

		// State function
		'Discovering Recipe Title' : function (line)
		{
			if (recipeTitle === '' && line)
			{
				// Store the recipe title.
				recipeTitle = line;
				console.log('Title: ' + line);
			}
			else
			{
				if (line === 'Ingredients')
				{
					// Move on to the next state.
					currentState = 'Reading Ingredients';
					console.log('Ingredients: ');
				}
			}
		},

		// State function
		'Reading Ingredients' : function (line)
		{
			if (line === '')
			{
				// Move on to the next state.
				currentState = 'Reading Ingredients Completed';
			}
			else
			{
				// Decode and store the ingredients.
				var obj = decodeIngredient(line);
				ingredients[obj.key] = obj;
				console.log(obj.key + ': ' + obj.value + '(type=' + obj.type + ')');
			}
		},

		// State function
		'Reading Ingredients Completed' : function (line)
		{
			if (line === 'Method')
			{
				// Move on to the next state.
				currentState = 'Reading Instructions';
				console.log('Method: ');
			}
		},

		// State function
		'Reading Instructions' : function (line)
		{
			if (line === '')
			{
				// Move on to the next state.
				currentState = 'Serving Dishes';
			}
			else
			{
				// Execute the instruction.
				this.doInstruction(line);
			}
		},

		// State function
		'Serving Dishes' : function (line)
		{
			// The final statement in a Chef recipe is a statement of how many people it serves.
			if (line.slice(0, 'Serves '.length) === 'Serves ')
			{
				// Store the contents of the first {numberOfDiners} baking dishes into {diners} property.
				// {diners} property will then be available via getDiners(). 
				console.log(line);
				var numberOfDiners = line.slice('Serves '.length);
				this.prepareDishes(parseInt(numberOfDiners));
				console.log('\t+++++ Done. The number of diners : ' + numberOfDiners);
			}
		},

		// Move the specified number of dishes into output buffer (diners)
		prepareDishes : function (numberOfDiners)
		{
			if (bakingDishes.length < numberOfDiners)
			{
				throw new Error('There\'s not enough dishes.');
			}
			for (var i = 0; i < numberOfDiners; i++)
			{
				var dish = bakingDishes[i];
				var str = '';
				var item;
				while (item = dish.pop())
				{
					if (item.type === 'dry')
					{
						str += item.value;
					}
					else 
					{
						str += String.fromCharCode(item.value);
					}
				}
				diners.push(str);
			}
		},

		// Getter (finished dishes)
		getDiners : function ()
		{
			return diners;
		},

		// Getter (the first mixing bowl)
		getFirstMixingBowl : function ()
		{
			return mixingBowls[0];
		},

		// Copy the contents of mixing bowls and baking dishes
		copyIntermediateValues : function (bowls, dishes)
		{
			var i, j;
			for (i = 0; i < bowls.length; i++)
			{
				if (mixingBowls[i] == undefined)
					mixingBowls[i] = [];
				for (j = 0; j < bowls[i].length; j++)
				{
					var obj = {value: bowls[i][j].value, type: bowls[i][j].type};
					mixingBowls[i].push(obj);
				}
			}
			for (i = 0; i < dishes.length; i++)
			{
				if (bakingDishes[i] == undefined)
					bakingDishes[i] = [];
				for (j = 0; j < dishes[i].length; j++)
				{
					var obj = {value: sidhes[i][j].value, type: dishes[i][j].type};
					bakingDishes[i].push(obj);
				}
			}
		},

		// Decode a statement and invoke Chef methods.
		doInstruction : function (line)
		{
			try
			{
				console.log(line);

				// Read and execute a Chef statement.
				var params = line.split(/\s+/);
				if (params[0] in this && this[params[0]] instanceof Function)
				{
						this[params[0]](params.slice(1, params.length));
				}
				else
				{
					this.Verb(params);
				}
			}
			catch (e)
			{
				throw new Error('Instruction => "' + line + '" : ' + e.message);
			}
		},

		/* ----------------------------------------
		 * Chef method - Take
		 * Syntax: {Take ingredient from refrigerator.}
		 * This reads a numeric value from STDIN into the ingredient named, overwriting any previous value.
		 * (Not supported)
		 * ----------------------------------------
		 */
		Take : function (params)
		{
			throw new Error('Sorry, "Take" statement ("Take xxx from refrigerator") is not supported.');	
		},

		/* ----------------------------------------
		 * Chef method - Put
		 * Syntax: {Put ingredient into [nth] mixing bowl.}
		 * This puts the ingredient into the nth mixing bowl.
		 * ----------------------------------------
		 */
		Put : function (params)
		{

			// Look up the ingredient.
			var ingredientName = extractIngredientName(params, 0, 'into');
			var ingredient = ingredients[ingredientName];
			if (!ingredient || ingredient.value === undefined)
			{
				throw new Error('Undefined ingredient => "' + ingredientName + '"');
			}

			// Look up the mixing bowl.
			var bowlIndex = extractMixingBowlIndex(params);
			if (bowlIndex === false)
			{
				throw new Error('Syntax error => Mixing bowl must be specified.');
			}

			// Put the ingredient into the mixing bowl.
			if (!mixingBowls[bowlIndex])
			{
				mixingBowls[bowlIndex] = [];
			}
			var obj = {value: ingredient.value, type: ingredient.type};
			mixingBowls[bowlIndex].push(obj);

			console.log('\tPut "' + ingredientName + '"(=' + obj.value + ') into the mixing bowl[' + bowlIndex + ']"');
		},

		/* ----------------------------------------
		 * Chef method - Fold
		 * Syntax: {Fold ingredient into [nth] mixing bowl.}
		 * This removes the top value from the nth mixing bowl and places it in the ingredient.
		 * ----------------------------------------
		 */
		Fold : function (params)
		{
			// Look up the ingredient.
			var ingredientName = extractIngredientName(params, 0, 'into');
			var ingredient = ingredients[ingredientName];
			if (!ingredient || ingredient.value === undefined)
			{
				throw new Error('Undefined ingredient => "' + ingredientName + '"');
			}

			// Look up the mixing bowl.
			var bowlIndex = extractMixingBowlIndex(params);
			if (bowlIndex === false)
			{
				throw new Error('Syntax error => Mixing bowl must be specified.');
			}
			var bowl = mixingBowls[bowlIndex];
			if (!bowl)
			{
				throw new Error('Syntax error => Specified mixing bowl[' + bowlIndex + '] is empty.');
			}

			// Remove the top item from the mixing bowl and copy its value to the ingredient.
			var obj = bowl.pop();
			ingredient.type = obj.type;
			ingredient.value = obj.value;

			console.log('\tRemoved the top item(=' + obj.value + ') from the mixing bowl[' + bowlIndex + '] and copy the value to "' + ingredientName + '"');
		},

		ingredientAndMixingBowl: function (params, separator)
		{
			// Look up the ingredient.
			var ingredientName = extractIngredientName(params, 0, separator);
			if (ingredientName !== 'dry ingredients')
			{
				var ingredient = ingredients[ingredientName];
				if (!ingredient || ingredient.value === undefined)
				{
					throw new Error('Undefined ingredient => "' + ingredientName + '"');
				}
			}

			// Look up the mixing bowl.
			var mixingBowlIndex = extractMixingBowlIndex(params);
			if (mixingBowlIndex === false)
			{
				mixingBowlIndex = 0;
			}
			var mixingBowl = mixingBowls[mixingBowlIndex];
			if (!mixingBowl)
			{
				throw new Error('Syntax error => Specified mixing bowl[' + mixingBowlIndex + '] is empty.');
			}

			// Return both objects.
			return {ingredientName: ingredientName, ingredient: ingredient, mixingBowlIndex: mixingBowlIndex, mixingBowl: mixingBowl};
		},

		/* ----------------------------------------
		 * Chef method - Add
		 * Syntax: {Add ingredient [to [nth] mixing bowl].}
		 * This adds the value of ingredient to the value of the ingredient on top of the nth mixing bowl 
		 * and stores the result in the nth mixing bowl.
		 * ----------------------------------------
		 * Syntax: {Add dry ingredients [to [nth] mixing bowl].}
		 * This adds the values of all the dry ingredients together and places the result into the nth mixing bowl.
		 * ----------------------------------------
		 */
		Add : function (params)
		{
			// Look up the ingredient and the mixing bowl.
			var obj = this.ingredientAndMixingBowl(params, 'to');

			if (obj.ingredientName === 'dry ingredients')
			{
				// Add the values of all the dry ingredients together and places the result into the nth mixing bowl.
				var sum = 0;
				ingredients.forEach(function(v){
					if (v && v.type === 'dry')
						sum += v.value;
				});
				var newObj = {value: sum};
				obj.mixingBowl.push(newObj);

				console.log('\tAdded the values of all dry ingredients together (=' + newObj.value 
					+ ') and places the result into the mixing bowl[' + obj.mixingBowlIndex + '].');
			}
			else
			{
				// Add the value of the ingredient to the value of the ingredient on top of the mixing bowl.
				var topItem = obj.mixingBowl[obj.mixingBowl.length - 1];
				topItem.value += obj.ingredient.value;

				console.log('\tAdded the value of "' + obj.ingredientName + '"(=' + obj.ingredient.value 
					+ ') to the value of the ingredient on top of the mixing bowl[' + obj.mixinBowlIndex
					+ '].(the result value = ' + topItem.value + ')');
			}
		},

		/* ----------------------------------------
		 * Chef method - Remove
		 * Syntax: {Remove ingredient [from [nth] mixing bowl].}
		 * This subtracts the value of ingredient from the value of the ingredient on top of the nth mixing bowl 
		 * and stores the result in the nth mixing bowl.
		 * ----------------------------------------
		 */
		Remove : function (params)
		{
			// Look up the ingredient and the mixing bowl.
			var obj = this.ingredientAndMixingBowl(params, 'from');

			// Remove the value of the ingredient from the value of the ingredient on top of the mixing bowl.
			var topItem = obj.mixingBowl[obj.mixingBowl.length - 1];
			topItem.value -= obj.ingredient.value;

			console.log('\tSubtracted the value of "' + obj.ingredientName + '"(=' + obj.ingredient.value 
				+ ') from the value of the ingredient on top of the mixing bowl[' + obj.mixingBowlIndex 
				+ '].(the result value = ' + topItem.value + ')');
		},

		/* ----------------------------------------
		 * Chef method - Combine
		 * Syntax: {Combine ingredient [into [nth] mixing bowl].}
		 * This multiplies the value of ingredient by the value of the ingredient on top of the nth mixing bowl 
		 * and stores the result in the nth mixing bowl.
		 * ----------------------------------------
		 */
		Combine : function (params)
		{
			// Look up the ingredient and the mixing bowl.
			var obj = this.ingredientAndMixingBowl(params, 'into');

			// Multiple the value of the ingredient by the value of the ingredient on top of the mixing bowl.
			var topItem = obj.mixingBowl[obj.mixingBowl.length - 1];
			topItem.value *= obj.ingredient.value;

			console.log('\tMultiplied the value of "' + obj.ingredientName + '"(=' + obj.ingredient.value 
				+ ') by the value of the ingredient on top of the mixing bowl[' + obj.mixingBowlIndex 
				+ '].(the result value = ' + topItem.value + ')');
		},

		/* ----------------------------------------
		 * Chef method - Divide
		 * Syntax: {Divide ingredient [into [nth] mixing bowl].}
		 * This divides the value of ingredient into the value of the ingredient on top of the nth mixing bowl 
		 * and stores the result in the nth mixing bowl.
		 * ----------------------------------------
		 */
		Divide : function (params)
		{
			// Look up the ingredient and the mixing bowl.
			var obj = this.ingredientAndMixingBowl(params, 'into');

			// Multiple the value of the ingredient by the value of the ingredient on top of the mixing bowl.
			var topItem = obj.mixingBowl[obj.mixingBowl.length - 1];
			topItem.value /= obj.ingredient.value;

			console.log('\tDivided the value of "' + obj.ingredientName + '"(=' + obj.ingredient.value 
				+ ') into the value of the ingredient on top of the mixing bowl[' + obj.mixingBowlIndex 
				+ '].(the result value = ' + topItem.value + ')');
		},

		/* ----------------------------------------
		 * Chef method - Liquefy
		 * Syntax: {Liquefy ingredient.}
		 * This turns the ingredient into a liquid, i.e. a Unicode character for output purposes.
		 * ----------------------------------------
		 * Syntax: {Liquefy contents of the [nth] mixing bowl.}
		 * This turns all the ingredients in the nth mixing bowl into a liquid, i.e. a Unicode characters for output purposes.
		 * ----------------------------------------
		 */
		Liquefy : function (params)
		{
			var bowlIndex = extractMixingBowlIndex(params);
			if (bowlIndex === false)
			{
				bowlIndex = 0;
			}
			var ingredients = mixingBowls[bowlIndex];
			if (!ingredients)
			{
				throw new Error('Syntax error => Specified mixing bowl[' + bowlIndex + '] is empty.');
			}
			for (var i = 0; i < ingredients.length; i++)
			{
				ingredients[i].type = 'liquid';
			}
		},

		/* ----------------------------------------
		 * Chef method - Stir
		 * Syntax: {Stir [the [nth] mixing bowl] for number minutes.}
		 * This "rolls" the top number ingredients in the nth mixing bowl, 
		 * such that the top ingredient goes down that number of ingredients 
		 * and all ingredients above it rise one place. 
		 * If there are not that many ingredients in the bowl, 
		 * the top ingredient goes to tbe bottom of the bowl and all the others rise one place.
		 * ----------------------------------------
		 * Syntax: {Stir ingredient into the [nth] mixing bowl.}
		 * This rolls the number of ingredients in the nth mixing bowl equal to the value of ingredient, 
		 * such that the top ingredient goes down that number of ingredients 
		 * and all ingredients above it rise one place. 
		 * If there are not that many ingredients in the bowl, 
		 * the top ingredient goes to the bottom of the bowl and all the others rise one place.
		 * ----------------------------------------
		 */
		Stir : function (params)
		{
			if (params.indexOf('into') !== -1)
			{
				// Look up the ingredient and the mixing bowl.
				var obj = this.ingredientAndMixingBowl(params, 'into');

		 		// Move the top ingredient goes down that number of ingredients 
				// and all ingredients above it rise one place. 
				var topItem = obj.mixingBowl.pop();
				var index = obj.ingredient.value < obj.mixingBowl.length ? obj.mixingBowl.length - obj.ingredient.value : 0;
				obj.mixingBowl.splice(index, 0, topItem);

				console.log('\tMoved the top ingredient of the mixing bowl[' + obj.mixingBowlIndex 
					+ ']. (' + (obj.mixingBowl.length - 1) + ' => ' + index + ')');
			}
			else
			{
				// Look up the mixing bowl.
				var bowlIndex = extractMixingBowlIndex(params);
				if (bowlIndex === false)
				{
					bowlIndex = 0;
				}
				var mixingBowl = mixingBowls[bowlIndex];
				if (!mixingBowl)
				{
					throw new Error('Syntax error => Specified mixing bowl[' + bowlIndex + '] is empty.');
				}
				var numIndex = params.indexOf('minutes');
				var num = 0;
				if (index === -1 || (num = parseInt(params[numIndex - 1])) === NaN)
				{
					throw new Error('Syntax error.');
				}
		 		// Move the top ingredient goes down that number
				// and all ingredients above it rise one place. 
				var topItem = mixingBowl.pop();
				var index = num < mixingBowl.length ? mixingBowl.length - num : 0;
				mixingBowl.splice(index, 0, topItem);

				console.log('\tMoved the top ingredient of the mixing bowl[' + bowlIndex 
					+ ']. (' + (mixingBowl.length - 1) + ' => ' + index + ')');
			}
		},

		/* ----------------------------------------
		 * Chef method - Mix
		 * Syntax: {Mix [the [nth] mixing bowl] well.}
		 * This randomises the order of the ingredients in the nth mixing bowl.
		 * (Not supported)
		 * ----------------------------------------
		 */
		Mix : function (params)
		{
			throw new Error('Sorry, "Mix" statement is not supported.');	
		},

		/* ----------------------------------------
		 * Chef method - Clean
		 * Syntax: {Clean [nth] mixing bowl.}
		 * This removes all the ingredients from the nth mixing bowl.
		 * ----------------------------------------
		 */
		Clean : function (params)
		{
			// Look up the mixing bowl.
			var bowlIndex = extractMixingBowlIndex(params);
			if (bowlIndex === false)
			{
				bowlIndex = 0;
			}
			// Remove all the ingredients from the mixing bowl.
			mixingBowls[bowlIndex] = [];
			console.log("\tRemoved all the ingredients from the mixing bowl[" + bowlIndex + '].');
		},

		/* ----------------------------------------
		 * Chef method - Pour
		 * Syntax: {Pour contents of the [nth] mixing bowl into the [pth] baking dish.}
		 * This copies all the ingredients from the nth mixing bowl to the pth baking dish, 
		 * retaining the order and putting them on top of anything already in the baking dish.
		 * ----------------------------------------
		 */
		Pour  : function (params)
		{
			// Look up the mixing bowl.
			var bowlIndex = extractMixingBowlIndex(params);
			if (bowlIndex === false)
			{
				throw new Error('Syntax error => Mixing bowl must be specified.');
			}

			var ingredients = mixingBowls[bowlIndex];
			if (!ingredients)
			{
				throw new Error('Syntax error => Specified mixing bowl[' + bowlIndex + '] is empty.');
			}

			// Look up the baking dish.
			var dishIndex = extractBakingDishIndex(params);
			if (dishIndex === false)
			{
				throw new Error('Syntax error => Baking dish must be specified.');
			}

			// Copy all the ingredients from the mixing bowl to the baking dish, 
			if (!bakingDishes[dishIndex])
			{
				bakingDishes[dishIndex] = [];
			}
			for (var i = 0; i < ingredients.length; i++)
			{
				bakingDishes[dishIndex].push(ingredients[i]);
			}
		},

		/* ----------------------------------------
		 * Chef method - Set
		 * Syntax: {Set aside.}
		 * This causes execution of the innermost loop in which it occurs to end immediately 
		 * and execution to continue at the statement after the "until".
		 * ----------------------------------------
		 */
		Set : function (params)
		{
			if (loopStack.length > 0)
			{
				var loop = loopStack[loopStack.length - 1];
				loop.forceExit = true;
			}
		},

		/* ----------------------------------------
		 * Chef method - Serve
		 * Syntax: {Serve with auxiliary-recipe.}
		 * This invokes a sous-chef to immediately prepare the named auxiliary-recipe. 
		 * The calling chef waits until the sous-chef is finished before continuing. 
		 * ----------------------------------------
		 */
		Serve : function (params)
		{
			if (params[0] !== 'with')
			{
				throw new Error('Syntax error.');
			}
			var auxiliaryRecipe = params.slice(1, params.length).join(' ');
			// Seek to the auxiliary recipe.
			for (var i = 0; i < lines.length; i++)
			{
				if (lines[i].trim().toLowerCase() === auxiliaryRecipe.toLowerCase())
				{
					var jumpTo = i;
					break;
				}
			}
			if (jumpTo == undefined)
			{
				throw new Error('Syntax error: Auxiliary recipe - ' + auxiliaryRecipe + ' - is not found.');
			}
			console.log("\t+++++ Invoke external recipe!");
			var sousChef = init(lines, jumpTo);
			sousChef.copyIntermediateValues(mixingBowls, bakingDishes);
			sousChef.run();
			var firstMixingBowl = sousChef.getFirstMixingBowl();
			if (mixingBowls[0] == undefined)
				mixingBowls[0] = [];
			for (i = 0; i < firstMixingBowl.length; i++)
			{
				mixingBowls[0].push(firstMixingBowl[i]);
			}
		},

		/* ----------------------------------------
		 * Chef method - Refrigerate
		 * Syntax: {Refrigerate [for number hours].}
		 * This causes execution of the recipe in which it appears to end immediately. 
		 * If in an auxiliary recipe, the auxiliary recipe ends and the sous-chef's first mixing bowl is passed back to the calling chef as normal. 
		 * If a number of hours is specified, the recipe will print out its first number baking dishes (see the Serves statement below) before ending.
		 * ----------------------------------------
		 */
		Refrigerate : function (params)
		{
			if (params && params.length >= 3
				&& params[0].trim() === 'for' 
				&& params[2].trim() === 'hours')
			{
				this.prepareDishes(parseInt(params[1]));
			}
			exitMainLoop = true;
			console.log("\t+++++ Exit from external recipe!");
		},

		/* ----------------------------------------
		 * Chef method - (arbitrary word of verb)
		 * Syntax: {Verb the ingredient.}
		 * This marks the beginning of a loop. It must appear as a matched pair with the following statement. 
		 * The loop executes as follows: The value of ingredient is checked. If it is non-zero, 
		 * the body of the loop executes until it reaches the "until" statement. 
		 * The value of ingredient is rechecked. If it is non-zero, the loop executes again. 
		 * If at any check the value of ingredient is zero, the loop exits and execution continues at the statement after the "until". 
		 * Loops may be nested.
		 * ----------------------------------------
		 * Syntax: {Verb [the ingredient] until verbed.}
                 * This marks the end of a loop. It must appear as a matched pair with the above statement. 
		 * verbed must match the Verb in the matching loop start statement. The Verb in this statement may be arbitrary and is ignored. 
		 * If the ingredient appears in this statement, its value is decremented by 1 when this statement executes. 
		 * The ingredient does not have to match the ingredient in the matching loop start statement.
		 * ----------------------------------------
		 */
		Verb : function (params)
		{
			// Look up an ingredient that is checked on each iteration.
			var ingredientName = extractIngredientName(params, 1);
			var ingredientToCheck = ingredients[ingredientName];
			if (!ingredientToCheck || ingredientToCheck.value === undefined)
			{
				throw new Error('Undefined ingredient => "' + ingredientName + '"');
			}


			// Seek to the end of the loop.
			for (var i = currentLine; i < lines.length; i++)
			{
				if (lines[i].indexOf(' until ') != -1)
					break;
			}
			if (i === lines.length)
			{
				throw new Error('Endless loop detected.');
			}

			// Look up an ingredient that is decremented on each iteration.
			var endParams = lines[i].split(/\s+/);
			ingredientName = extractIngredientName(endParams, 1, 'until');
			var ingredientToDecrement = ingredients[ingredientName];

			// Store the loop information into the stack.
			var obj = {start: currentLine, end: i, ingredientToCheck: ingredientToCheck, ingredientToDecrement: ingredientToDecrement};
			loopStack.push(obj);

			console.log('\t+++++ Loop enter!');
		}
	};
}


function decodeIngredient(line)
{
	var items = line.split(/\s+/);
	var obj = {};
	if (items.length < 1)
	{
		throw new Error('Invalid ingredient: "' + line + '"');
	}
	else if (items.length === 1)
	{
		obj.key = items[0].trim();
	}
	else 
	{
		obj.value = parseInt(items[0].trim());
		var item = items[1].trim();
		var start = 1;
		if (item === 'heaped' || item === 'level')
		{
			obj.type = 'dry';
			start = 3;
		}
		else if (item === 'g' || item === 'kg' || item === 'pinch' || item === 'pinches')
		{
			obj.type = 'dry';
			start = 2;
		}
		else if (item === 'ml' || item === 'l' || item === 'dash' || item === 'dashes')
		{
			obj.type = 'liquid';
			start = 2;
		}
		else if (item === 'cup' || item === 'cups' || item === 'teaspoon' || item === 'teaspoons' || item === 'tablespoon' || item === 'tablespoons')
		{
			start = 2;
		}
		obj.key = items.slice(start, items.length).join(' ');
	}
	return obj;
}

function extractNumber(str)
{
	var ord = str.slice(-2);
	if (ord === 'st' || ord === 'nd' || ord === 'rd' || ord === 'th')
	{
		return parseInt(str.slice(0, -2));
	}
	return false;
}

function extractIngredientName(params, startIndex, endStr)
{
	var end;
	if (endStr === undefined || (end = params.indexOf(endStr)) === -1)
	{
		end = params.length;
	}
	var start = startIndex;
	if (params[start].trim() === 'the')
	{
		start++;
	}
	return params.slice(start, end).join(' ');
}

function extractMixingBowlIndex(params)
{
	var trailer = params.indexOf('mixing');
	if (trailer === -1 || trailer === 0)
	{
		return false;
	}
	var index = extractNumber(params[trailer - 1]);
	if (index === NaN)
	{
		return false;
	}
	else if (index === false)
	{
		return 0;
	}
	return index;
}

function extractBakingDishIndex(params)
{
	var trailer = params.indexOf('baking');
	if (trailer === -1)
	{
		return false;
	}
	var index = extractNumber(params[trailer - 1]);
	if (index === NaN)
	{
		return false;
	}
	else if (index === false)
	{
		return 0;
	}
	return index;
}

// Program's entry point
function run(input) 
{
	// Split a text into lines
	var lines = input.split(/\r\n|\r|\n/);

	for (var i = 0; i < lines.length; i++)
	{
		var line = lines[i].trim();
		if (line === '')
			continue;

		// Split a line into statements
		var stmts = line.split(/\s*\.\s*/);
		if (stmts && stmts.length > 0)
		{
			lines.splice(i, 1);
			for (var j = 0, k = 0; j < stmts.length; j++)
			{
				var stmt = stmts[j].trim();
				if (stmt === '')
					continue;
				lines.splice(i + k, 0, stmt);
				k++;
			}
			i += (k - 1);
		}
	}
	// Create the head chef.
	var chef = init(lines, 0);
	chef.run();
	// Return the finished dishes.
	return chef.getDiners();
}

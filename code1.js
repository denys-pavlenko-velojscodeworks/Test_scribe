// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// import { session, local } from 'wix-storage';
// function validateString(inputString) {
// 		if (inputString.length < 2 || inputString > 100) {
// 			return false;
// 		}
//         const pattern = /^[a-zA-Z]+$/;
//         const isValid = pattern.test(inputString);
//         return isValid;
//     }

// $w.onReady(function () {
// 	session.setItem("page","con")

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

// });

// export function button1_click(event) {
	// if ( $w("#input4"))	
// }

// export function input3_input(event) {
// 	const newText = event.target.value
// 	console.log(validateString(newText))

	// if(validateString(newText)) {
	// 	$w('#input4').value = newText;
	// 	$w('#button1').enable()
	// } else {
	// 	$w('#button1').disable()
	// 	return;
	// }
// }

// export function input4_input(event) {
// 	const newText = event.target.value
// 	console.log(validateString(newText))

	// if(validateString(newText)) {
	// 	$w('#input4').value = newText;
	// 	$w('#button1').enable()
	// } else {
	// 	$w('#button1').disable()
	// 	return;
	// }
// }



// ================================= DY BELOW is a logic for validationg all CONTACT section's inputs

$w.onReady(function () {
    // Disable the submit button by default
    $w("#button1").disable();

    // Below is an event listeners for input fields
    $w("#input4, #input3, #input2, #textBox1").onInput(() => {
        validateInputs();
    });

// Below inputs validation logic
	function validateInputs() {

    	const firstName = $w("#input4").value.trim();
    	const lastName = $w("#input3").value.trim();
    	const email = $w("#input2").value.trim();
		const message = $w("#textBox1").value.trim();


		const namePattern = /^$|^[a-zA-Z\s\-]+$/;
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const messagePattern = /^[\s\S\n]*$/;

// Below is a check of the input field for an input specific pattern
		function areValidLettersOnly(input, pattern) {
    		let inputValue = input.toLowerCase();

    		return pattern.test(inputValue);
		}

// Below is a check of the input field for an input length
		function isValidLengthOnly(input, minLength, maxLength) {
    		let nameValue = input.toLowerCase().trim();
    		const correctLength = nameValue.length >= minLength && nameValue.length <= maxLength; 

    		return correctLength;
		}

// Below is a check of the input field for completeness
		function isValidInputOnly(nameInput) {
    		let nameValue = nameInput.toLowerCase();
    		let notEmpty = nameValue.trim() !== '';

    		return notEmpty;
		}


		let contactErrorMessage = 'Error message';

// Below are 4 inputs validation 
		

		$w("#input4").onFocus(() => {
        	$w("#input4").resetValidityIndication(); // Reset any previous validation indications
    	});

		$w("#input4").onCustomValidation((value, reject) => {
    		const minLen = 2;
			const maxLen = 30;
			const pattern = /^[a-zA-Z\s\-]+$/;  


			// $w("#input4").resetValidityIndication();
				console.log(value);
    			if(!isValidInputOnly(value)) {
        			contactErrorMessage = "Please fill in this field.";
        			reject(contactErrorMessage);
    			} else if (!areValidLettersOnly(value, pattern)) {
        			contactErrorMessage = "Your input should contain only letters. Please try again.";
        			reject(contactErrorMessage);
    			} else if (!isValidLengthOnly(value, minLen, maxLen)) {
        			contactErrorMessage = `Your input must be between ${minLen} and ${maxLen} characters long. Please try again.`;
        			reject(contactErrorMessage);
    			}          
		}, true)

// ===========================================================================

	
		// ===========================================================================

		// Add focus event listener
    	// $w("#input4").onFocus(() => {
        // 	$w("#input4").resetValidityIndication(); // Reset any previous validation indications
    	// });
    
		
    	// // Add blur event listener
    	// $w("#input4").onFocus(() => {
        // 	$w("#input4").onCustomValidation((value, reject) => {
    	// 		const minLen = 2;
		// 		const maxLen = 30;
		// 		const pattern = /^[a-zA-Z\s\-]+$/;  

		// 		// $w("#input4").resetValidityIndication();
		// 			console.log(value);
    	// 			if(!value || !isValidInputOnly(value)) {
        // 				errorMessage = "The field is a JOKE and still required.";
        // 				reject(errorMessage);
    	// 			} else if (!areValidLettersOnly(value, pattern)) {
        // 				errorMessage = "Your input should contain only letters. Please try again.";
        // 				reject(errorMessage);
    	// 			} else if (!isValidLengthOnly(value, minLen, maxLen)) {
        // 				errorMessage = `Your input must be between ${minLen} and ${maxLen} characters long. Please try again.`;
        // 				reject(errorMessage);
    	// 			}   

		// 			$w("#input4").updateValidityIndication();       
		// 	})
    	// });

	// 	$w("#input4").onBlur(() => {
    //     // Get the value of the input field
    //     const inputValue = $w("#input4").value;

    //     // Check if the input value is empty
    //     if (!inputValue) {
    //         // Show the error message
    //         $w("#text165").text = "Please fill all fields that have an asterisk (*).";
    //         $w("#text165").show();
    //     } else {
    //         // Hide the error message if input is not empty
    //         $w("#text165").hide();
    //     }
    // });

		// ===========================================================================

		$w("#input3").onFocus(() => {
        	$w("#input3").resetValidityIndication(); // Reset any previous validation indications
    	});

		$w("#input3").onCustomValidation((value, reject) => {
    		const minLen = 2;
			const maxLen = 30;
			const pattern = /^[a-zA-Z\s\-]+$/;

    			if(!isValidInputOnly(value)) {
        			contactErrorMessage = "Please fill in this field.";
        			reject(contactErrorMessage);
    			} else if (!areValidLettersOnly(value, pattern)) {
        			contactErrorMessage = "Your input should contain only letters. Please try again.";
        			reject(contactErrorMessage);
    			} else if (!isValidLengthOnly(value, minLen, maxLen)) {
        			contactErrorMessage = `Your input must be between ${minLen} and ${maxLen} characters long. Please try again.`;
        			reject(contactErrorMessage);
    			}        
		})
  

		$w("#input2").onFocus(() => {
        	$w("#input2").resetValidityIndication(); // Reset any previous validation indications
    	});

		$w("#input2").onCustomValidation((value, reject) => {
    		const minLen = 5;
			const maxLen = 30;
			const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    			if(!isValidInputOnly(value)) {
        			contactErrorMessage = "Please fill in this field.";
        			reject(contactErrorMessage);
    			} else if (!areValidLettersOnly(value, pattern)) {
        			contactErrorMessage = "Please enter a valid email address.";
        			reject(contactErrorMessage);
    			} else if (!isValidLengthOnly(value, minLen, maxLen)) {
        			contactErrorMessage = `Your email must be between ${minLen} and ${maxLen} characters long. Please try again.`;
        			reject(contactErrorMessage);
    			}        
		})

		$w("#textBox1").onFocus(() => {
        	$w("#textBox1").resetValidityIndication(); // Reset any previous validation indications
    	});

		$w("#textBox1").onCustomValidation((value, reject) => {
    		const minLen = 5;
			const maxLen = 250;
			const pattern = /^[\s\S\n]*$/;

    			if(!isValidInputOnly(value)) {
        			contactErrorMessage = "Please fill in this field.";
        			reject(contactErrorMessage);
    			} else if (!areValidLettersOnly(value, pattern)) {
        			contactErrorMessage = "Please enter a valid message.";
        			reject(contactErrorMessage);
    			} else if (!isValidLengthOnly(value, minLen, maxLen)) {
        			contactErrorMessage = `Your message must be between ${minLen} and ${maxLen} characters long. Please try again.`;
        			reject(contactErrorMessage);
    			}          
			})
		


// Below is a submit button activation validaiton with an if statement
		if (areValidLettersOnly(firstName, namePattern) &&
			areValidLettersOnly(lastName, namePattern) &&
			areValidLettersOnly(email, emailPattern) &&
			areValidLettersOnly(message, messagePattern) &&
			isValidLengthOnly(firstName, 2, 30) &&
			isValidLengthOnly(lastName, 2, 30) &&
			isValidLengthOnly(email, 5, 30) &&
			isValidLengthOnly(message, 5, 250) &&
			isValidInputOnly(firstName) &&
			isValidInputOnly(lastName) &&
			isValidInputOnly(email) &&
			isValidInputOnly(message)
		) {
    		$w("#button1").enable();
		} else {
    		$w("#button1").disable();
		}
	}
})
// 
    // =================================

/**
*	Adds an event handler that runs when the input element receives
input.
	[Read more](https://www.wix.com/corvid/reference/$w.TextInputMixin.html#onInput)
*	 @param {$w.Event} event
*/

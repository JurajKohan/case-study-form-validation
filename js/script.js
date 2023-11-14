
(function () {
  
  
  // -------------------------------------------------------------------------
  // Main - attributes
  // -------------------------------------------------------------------------

  $('form').on('submit', e => {             
  e.preventDefault();
  let elements = e.target.elements;         
  let valid = {};                                                 
  let isFormValid;
  

  // -------------------------------------------------------------------------
  // GenericCheck
  // -------------------------------------------------------------------------

  let i;
  let isValid;                              
  for (i = 0, l = elements.length; i < l; i++) {
    isValid = validateRequired(elements[i]) && validateTypesAndSafety(elements[i]); 
    if (!isValid) {                                             
      showErrorMessage(elements[i], 'invalidmsg');                            
    } else {                                                                                                                   
      removeErrorMessage(elements[i])                          
    }                                                           
    valid[elements[i].id] = isValid;                            
  }
  
  // -------------------------------------------------------------------------
  // CustomCheck
  // -------------------------------------------------------------------------

  if (!validatePLZ(e)) {                
    showErrorMessage(document.getElementById('PLZ'), 'invalidmsg');
    valid.PLZ = false;                  
  } else {                             
    removeErrorMessage(document.getElementById('PLZ'));
  }

  // -------------------------------------------------------------------------
  // Main - method: didItPass
  // -------------------------------------------------------------------------

    for (let field in valid) {          
      if (!valid[field]) {              
        isFormValid = false;            
        break;                          
      }                                 
      isFormValid = true;               
      
    }
    let query = $('form').serialize()
    let url = 'registered.html?'+ query
    if(isFormValid) setTimeout(function() {window.location.href = url},500);
    //if(!isFormValid) e.preventDefault();
     
    
  });                                   
  
  // -------------------------------------------------------------------------
  // ValidateRequired
  // -------------------------------------------------------------------------

  let responses = {
    vornamename: 'Bitte gib deinen Vor- und Nachnamen ein', 
    email: 'Bitte gib eine gültige E-Mail-Adresse ein',
    region: 'Bitte wähle eine Krisenregion aus',
    kleidung: 'Bitte wähle eine Option aus',
    strasse: 'Bitte gib deine Straße und Straßennummer ein',
    PLZ: 'Bitte gib deine PLZ ein'
  };
  
  function validateRequired(el) { 
    
    if (el.required) {                              
      let valid = (el.type == "checkbox") ? el.checked : el.value;                      
      if (!valid) {                                 
        setErrorMessage(el, responses[el.id]);
        setStyle(el,'invalid')
        el.invalid = true
      } 
      else {setStyle(el,'valid')}
                    
      return valid;                                 
    }
    return true;                                    
  }
 
  // -------------------------------------------------------------------------
  // ValidateTypesAndSafety
  // -------------------------------------------------------------------------  
  
  function validateTypesAndSafety(el) {
    if (!el.value) return true;                     
    let type = el.getAttribute('type');              
    if (typeof validateType[type] === 'function') { 
      return validateType[type](el);                
    } else {                                        
      return true;                                  
    }
  }

  let validateType = {
    email: function (el) {                                 // Create email() method
      let valid = /[^@]+@[^@]+/.test(el.value) && escapeForXSS(el.value) === el.value; 
      if (!valid) {                                        // If the value of valid is not true
        setErrorMessage(el, 'Ungültige E-Mail-Adresse oder unerlaubte Zeichen'); // Set error message
        setStyle(el,'invalid')
      } 
      else {setStyle(el,'valid')}
      return valid;                                        // Return the valid variable
    },
    text: function (el) {                                
      let valid = escapeForXSS(el.value) === el.value;                  // Store result of test in valid
      if (!valid) {
        setErrorMessage(el, 'Unerlaubte Zeichen', 'inval_val', 0);
        setStyle(el,'invalid')
      }
      else {setStyle(el,'valid')}
      return valid;
    },
    
  };

  function escapeForXSS(input) {
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
  }
  
  // -------------------------------------------------------------------------
  // PLZ ÜBERPRÜFUNG & ADRESSFELD STEUERUNG
  // -------------------------------------------------------------------------    
  
  // PLZ TIP & ÜBERPRÜFUNG
  let $plz = $(document.getElementById('PLZ'));
  
  $plz.on('focus', () => {                           
    setErrorMessage($plz, "Nur PLZ im Format 12... akzeptiert");
    setStyle($plz, 'wipe')
    showErrorMessage($plz, 'tip');
  })
  
  $plz.on('blur', e => {
    let valid = validatePLZ(e)
    if(!valid) showErrorMessage(e.target, 'invalidmsg');
    else removeErrorMessage(e.target)                                 
  })
  
  // ADRESSFELD STEUERUNG

  let abgabe = document.getElementById('abgabe');
  let abholung = document.getElementById('abholung');
  let adresse = document.getElementById('adresse');
  adresse.className = 'hide';

  abgabe.addEventListener('click', adresseCheck, false); 
  abholung.addEventListener('click', adresseCheck, false);

  function adresseCheck(e) {
    let STR = document.getElementById('strasse');
    let PLZ = document.getElementById('PLZ')
    if(e.target == abgabe) {
      adresse.className = 'hide';
      STR.required = false;
      STR.value = "";
      removeErrorMessage(STR)
      styleObject['wipe'](STR);
      
      PLZ.required = false;
      PLZ.value = "";
      removeErrorMessage(PLZ)
      styleObject['wipe'](PLZ); 
      
    } else {
      adresse.className = '';
      STR.required = true;
      PLZ.required = true;
    }
  
}

  
  
  
  // -----------------------------------------------------------------------------------------------
  // SetErrorMessage / SetStyle / ShowErrorMessage / RemoveErrorMessage / styleObject / validatePLZ 
  // -----------------------------------------------------------------------------------------------


  function setErrorMessage(el, message) {
    $(el).data('errorMessage', message)                 
  }

  function setStyle(el, style) {
    $(el).data('style', style)                 
  }

  function getErrorMessage(el) {
    return $(el).data('errorMessage')                    
  }

  function showErrorMessage(el, errorMsgStyle) {
    let $el = $(el);
    let style = $el.data('style');                                      
    if (style) styleObject[style]($el);
    
    
    let errorContainer = $el.siblings('.error.message'); // Any siblings holding an error message

    if (!errorContainer.length) {                         // If no errors exist with the element
       errorContainer = $('<div class="error message"></div>').insertAfter($el); 
    }
    
    errorContainer.text(getErrorMessage(el));             // Add error message
    styleObject[errorMsgStyle](errorContainer);
  }

  function removeErrorMessage(el) {
    let $el = $(el);
    
    
    let errorContainer = $el.siblings('.error.message'); // Get the sibling of this form control used to hold the error message
    errorContainer.remove(); 
    let style = $el.data('style');                                      
    if (style) styleObject[style]($el);                              
  }

  let styleObject = {
    invalid : function(el) {
      let $el = $(el);
      styleObject['wipe']($el);
      $el.addClass('is-invalid');
    },
    valid : function(el) {
      let $el = $(el);
      styleObject['wipe']($el);
      $el.addClass('is-valid');
    },
    tip: function(el) {
      let $el = $(el);
      styleObject['wipe']($el);
      $el.addClass('tip');
    },
    invalidmsg : function(el) {
      let $el = $(el);
      styleObject['wipe']($el);
      $el.addClass('invalid-message');
    },
    wipe: function(el) {
      let $el = $(el);
      if($el.hasClass('is-valid')) {$el.removeClass('is-valid')};
      if($el.hasClass('is-invalid')) {$el.removeClass('is-invalid')};
      if($el.hasClass('tip')) {$el.removeClass('tip')};
      if($el.hasClass('invalid-message')) {$el.removeClass('invalid-message')};
    },
  }

  function validatePLZ(e) {
    let PLZ = document.getElementById('PLZ');
    let plz_value = PLZ.value;
    let valid;
    let target = e.target.id;
    let test = /^12+\d{3}$/.test(plz_value);   
    
    if(target == 'form1' && PLZ.required) {
      if (!test) {                                                          
        setErrorMessage(PLZ, (plz_value) ? "Falsche Länge oder Format!" : "Bitte gib deine PLZ ein");  
        setStyle(PLZ,'invalid');
        valid = false;
      }
      else {                                                                                            
        setStyle(PLZ, 'valid');
        valid = true;
      }
      return valid
      }
    
    else if(target == 'PLZ') {
      if (plz_value) {                                                          
        if(!test) {                                                              
        setErrorMessage(PLZ, "Falsche Länge oder Format!"); 
        setStyle(PLZ,'invalid');
        valid = false;
        }                                                                     
        else {
          setStyle(PLZ, 'valid');
          valid = true
        }
      }
      else { 
        setStyle(PLZ,'wipe');                                                                                           
        valid = true;
      }
      return valid;
    }
    
    else {
      valid = true;
      return valid;
    }
  }

}());  // Ende von IIFE
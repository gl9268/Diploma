const multiInputs = document.createElement('template');
multiInputs.innerHTML = `
      <style>
          .multi-inputs {
            font-weight: bold;
            height: auto;
          }
          .multi-inputs div + div {
            margin: 7px 0 0 0;
          }
          .inputs-container {
            display: flex;
            overflow-x: auto;
            height: 142px;
            background-color: #F1F3F4;
          }

          .inputs-controls .btn {
            margin: 3px;
          }

      </style>

      <div class = multi-inputs>
        <div> 
        Adjust pitch &nbsp; <input class="btn btn-primary btn-sm" type="button" id="adjustbtn" value="Adjust"> 
        </div>
        <div class="inputs-container"></div>
        <div class="inputs-controls">
            <input class=" btn btn-primary btn-sm" id="shiftbtn" type="button" value="Shift">
            <input class=" btn btn-primary btn-sm" type="button" id="ampbtn" value="Amplify">
            <input class=" btn btn-primary btn-sm" type="button" id="invertbtn" value="Invert">
            <input class=" btn btn-primary btn-sm" type="button" id="flattenbtn" value="Flatten">
            <input class="btn btn-primary btn-sm" type="button" id="restorebtn" value="Restore">
        </div>
      </div>
`;

const templateSlider = document.createElement('template');
templateSlider.innerHTML = `
     <style>
        .input-wrapper {
          height: 125px;
          width: 50px;
          position: relative;
          background: #fff;
          flex: 0 0 auto;
        }

        input[type="range"] {
          transform: rotate(270deg);
          -webkit-appearance: none;
          cursor: pointer;
          position: absolute;
        /*  right: 20px; */
          top: 37px;
          left: -38px;
          width:125px; /* height of slider*/
          flex: 0 0 auto;
         }

        /* Track: webkit browsers */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 50px; /* width of slider */
          background: #F1F3F4;
          border: 0.02rem solid #F1F3F4;
        }

        /* Track: Mozilla Firefox */
        input[type="range"]::-moz-range-track {
          height: 50px;
          background: #F1F3F4;
          border: 0.02rem solid #F1F3F4;
        }

        /* Thumb: webkit */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 50px; /* width of slider thumb  */
          width: 0px; /* height of slider thumb */
          background-color: #fff;
          border: 1px solid #f50;
          border-radius: 50%;
        }

        /* Thumb: Firefox */
          input[type="range"]::-moz-range-thumb {
            height: 50px;
            width: 0px;
            background-color: #fff;
            border-radius: 50%;
            border: 1px solid #f50;
        }

        .fenom-span {
          z-index: 99;
          position: absolute;
          top: 0px;
          left: 50%;
          color: black;
          user-select: none;
        }
    </style>
    <div class=input-wrapper>
      <span class="fenom-span"></span>
      <input type="range" min="-3" max="3" step="any">
    </div>
`;


class PitchAdjuster extends HTMLElement {

  get inputString(){
    return this.getAttribute("input-string");
  }

  get pitchPreds(){
    return this.getAttribute("pitch-preds");
  }

  get dursPreds(){
    return this.getAttribute("durs-preds");
  }

    constructor() {
      super();
    }
    
    // attributes that trigger attributeChangedCallback 
    static get observedAttributes() {

      
      return ['input-string'];
    }

    // on connect
    connectedCallback() { 
      var multiInputsClone = multiInputs.content.cloneNode(true); // create a clone of the template
      var adjustButton = multiInputsClone.getElementById('adjustbtn');
      adjustButton.addEventListener("click", (event) => {
        const adjustEvent = new CustomEvent('adjust', {
          inputString: this.inputString,
          pitchPreds: this.arrPitchPreds
        });
        this.dispatchEvent(adjustEvent);
      });

      // control buttons event listeners
      var shiftButton = multiInputsClone.getElementById('shiftbtn');
      this.addButtonEventListeners(shiftButton, this.shift);
      var ampButton = multiInputsClone.getElementById('ampbtn');
      this.addButtonEventListeners(ampButton, this.amplify);
      var invertButton = multiInputsClone.getElementById('invertbtn');
      this.addButtonEventListeners(invertButton, this.invert);
      var flattenButton = multiInputsClone.getElementById('flattenbtn');
      this.addButtonEventListeners(flattenButton, this.flatten);
      var restoreButton = multiInputsClone.getElementById('restorebtn');
      this.addButtonEventListeners(restoreButton, this.restore.bind(this));
      this.append(multiInputsClone); // add component to the page
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // check if value has changed
      if (name == 'input-string') {
        //this.inputString = newValue;
        this.arrPitchPreds = arrStringToArr(this.pitchPreds);
        this.arrDursPreds = arrStringToArr(this.dursPreds);
        this.originalPitchPreds = [...this.arrPitchPreds];
        this.clearInputsContainer();
        this.renderInputs();
      } 
    }

    addButtonEventListeners(button, transformation){
      button.addEventListener("click", (event) => {
        for (let i = 0; i < this.arrPitchPreds.length; i++){
          var inputSlider = document.getElementById('pitchValue' + i);
          this.arrPitchPreds[i] = transformation(inputSlider.value, i);
          if (this.arrPitchPreds[i] > 3) this.arrPitchPreds[i] = 3; // [-3, 3] range
          if (this.arrPitchPreds[i] < -3) this.arrPitchPreds[i] = -3;
          inputSlider.value = this.arrPitchPreds[i];
        }
       });
    }

    shift(num){
      return parseFloat(num) + parseFloat(0.1)
    }

    amplify(num){
      return parseFloat(num)*parseFloat(1.1)
    }

    invert(num){
      return parseFloat(num)*parseFloat(-1);
    }

    flatten(num){
      return parseFloat(num)*parseFloat(0);
    }

    restore(num, i){
      return this.originalPitchPreds[i];
    }

    // clear container
    clearInputsContainer() {
      let inpcont = document.querySelector('.inputs-container')
      if (inpcont.firstChild){
        while (inpcont.firstChild) {
          inpcont.removeChild(inpcont.firstChild);
        }
      }
    }

    // render pitch change inputs
    renderInputs(){
      for (let i = 0; i < this.arrPitchPreds.length; i++){
        var inputClone = templateSlider.content.cloneNode(true);
        var input = inputClone.querySelector('input[type="range"]');
        input.setAttribute("id", "pitchValue" + i);
        input.setAttribute("value", this.arrPitchPreds[i]);
        //input.style.width = this.arrDursPreds[i]*100+10 + "px"; 
        input.addEventListener("input", (event) => {
          // change value in UI
        });

        var fspan = inputClone.querySelector('.fenom-span');
        fspan.textContent = this.inputString[i];
        
        input.addEventListener("change", (event) => {
          let newPitchValue = parseFloat(event.target.value);
          let changedInput = event.target.id;
          let inputId = changedInput.substring(10, changedInput.length);
          this.arrPitchPreds[inputId] = newPitchValue;
          event.target.setAttribute("value", newPitchValue);
        });
        document.querySelector('.inputs-container').appendChild(inputClone);
      }
    }

  }
  customElements.define("pitch-adjuster", PitchAdjuster);
  
  function arrStringToArr(arrString) {
    if (arrString){
      return arrString.split(',').map(parseFloat); 
    }
    else return
  }


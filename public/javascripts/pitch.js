
const adjuster = document.getElementById("adjuster");
adjuster.addEventListener('adjust', (event) => {
    requestData({
      inputString: event.inputString,
      pitchPreds: event.pitchPreds
    })
    // set player 
});


async function formClick(event) {
    event.preventDefault()
    try {
      var result = await requestData({
          inputString: document.getElementById("inputString").value
      })
      let pitchadjust = document.querySelector('pitch-adjuster');
      pitchadjust.setAttribute('pitch-preds', result.pitchPreds)
      pitchadjust.setAttribute('durs-preds', result.dursPreds)
      pitchadjust.setAttribute('input-string', result.inputString)

    } catch (error) {
      console.log(error)
    }
}

async function requestData(rq) {
    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rq)
      });
      
      if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  
  }
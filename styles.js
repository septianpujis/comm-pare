export const style = `

#image-controller-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  #image-controller-menu input[type="text"],
  #image-controller-menu input[type="range"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s ease;
  }
  
  #image-controller-menu input[type="text"]:focus,
  #image-controller-menu input[type="range"]:focus {
    outline: none;
    border-color: #007bff;
  }
  
  #image-controller-menu input[type="range"] {
    -webkit-appearance: none;
    height: 8px;
    background: #ddd;
    border-radius: 4px;
  }
  
  #image-controller-menu input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #007bff;
    border-radius: 50%;
    cursor: pointer;
  }
  
  #image-controller-menu button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  #image-controller-menu button:hover {
    background-color: #0056b3;
  }
  
  #image-controller-menu button:active {
    background-color: #004085;
  }
  `;

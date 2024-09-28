import './App.css';
import { Auth } from './components/Auth';
import {MainPage} from './components/Main';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className='Background'>
      <Router>
        <Routes>
          <Route path='/' element={<Auth />} />
          <Route path='/success' element={<MainPage/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

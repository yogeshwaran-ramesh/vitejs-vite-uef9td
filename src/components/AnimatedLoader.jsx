import { BoltLoader } from 'react-awesome-loaders';
export const AnimatedLoader = () => {
  return (
    <div className="loader-container">
      <BoltLoader
        className={'loaderbolt'}
        boltColor={'#ff4d00'}
        backgroundBlurColor={'#faccb9'}
      />
    </div>
  );
};

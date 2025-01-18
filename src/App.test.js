import { render, screen } from '@testing-library/react';
import App from './App';

/* Mock the PDF-related functions */
// jest.mock('jspdf');
// jest.mock('file-saver');
// jest.mock('canvg');

test('Renders logo header image with correct alt text', () => {
  render(<App />);

  const teamLogo = screen.getByRole('img', { name: 'About Stardial'});
  expect(teamLogo).toBeInTheDocument();

  const titleImage = screen.getByRole('img', { name: 'Star Path Viewer' });
  expect(titleImage).toBeInTheDocument();
});

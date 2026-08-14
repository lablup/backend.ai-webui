/*
 FR-3517 — `BAIMetadataListItem` widens Astryx's `string`-typed `label` to a
 `ReactNode` (CONVERSION-IDIOMS §3). These assert the two things idiom 3 says to
 check after using it: the node actually renders into the label cell, and the
 row's accessible name still reads as the label with the added control
 separately reachable.
*/
import BAIMetadataList, { BAIMetadataListItem } from './BAIMetadataList';
import { render, screen } from '@testing-library/react';

describe('BAIMetadataListItem', () => {
  it('renders a plain string label as before', () => {
    render(
      <BAIMetadataList>
        <BAIMetadataListItem label="Path">/vroot/local</BAIMetadataListItem>
      </BAIMetadataList>,
    );
    expect(screen.getByRole('term')).toHaveTextContent('Path');
    expect(screen.getByRole('definition')).toHaveTextContent('/vroot/local');
  });

  it('renders a ReactNode label, keeping the label text and the control separate', () => {
    render(
      <BAIMetadataList>
        <BAIMetadataListItem
          label={
            <>
              Path
              <button type="button" aria-label="Copy" />
            </>
          }
        >
          /vroot/local
        </BAIMetadataListItem>
      </BAIMetadataList>,
    );

    // The label cell still reads as the label…
    expect(screen.getByRole('term')).toHaveTextContent('Path');
    // …and the control is reachable under its own accessible name.
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });
});

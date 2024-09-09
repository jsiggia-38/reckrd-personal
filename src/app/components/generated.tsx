import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface SimilarSong {
  trackName: string;
  artistName: string;
  trackMBID: string;
  artistMBID: string;
  url: string;
  album: MusicBrainzAlbum;
}

interface MusicBrainzAlbum {
  title: string;
  mbid: string;
  image: string;
}

interface Props {
  songs: SimilarSong[];
}

export default function Generated(props: Props) {
  const [recommendedSongs, setRecommendedSongs] = useState(props.songs);

  useEffect(() => {
    setRecommendedSongs((prevSongs) => {
      const existingIds = new Set(prevSongs.map(song => song.trackMBID));
      const newSongs = props.songs.filter(song => !existingIds.has(song.trackMBID));
      return [...prevSongs, ...newSongs];
    });
  }, [props.songs]);

  const handleDeleteSong = (id: string) => {
    setRecommendedSongs((prevSongs) => prevSongs.filter(song => song.trackMBID !== id));
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(recommendedSongs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecommendedSongs(items);
  };

  return (
    <div style={{ backgroundColor: '#172D42', minHeight: '100vh', padding: '20px', color: '#fff', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Recommended Songs</h1>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="songs">
            {(provided) => (
              <ol style={{ listStyleType: 'decimal', padding: 0, margin: 0 }} {...provided.droppableProps} ref={provided.innerRef}>
                {recommendedSongs.map((song, index) => (
                  <Draggable key={song.trackMBID} draggableId={song.trackMBID} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          padding: '10px',
                          backgroundColor: '#284D73',
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <img src={song.album.image || 'https://placehold.it/128'} alt={song.trackName} style={{ width: '60px', height: '60px', marginRight: '10px', flexShrink: 0 }} />
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>
                            {song.artistName} - {song.trackName}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => handleDeleteSong(song.trackMBID)}>
                            ❌
                          </span>
                          <span style={{ cursor: 'move' }} {...provided.dragHandleProps}>
                            &#9776;
                          </span>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ol>
            )}
          </Droppable>
        </DragDropContext>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button style={{ backgroundColor: '#1DB954', color: '#fff', border: 'none', borderRadius: '4px', padding: '15px 30px', fontSize: '20px', cursor: 'pointer', marginTop: '20px', width: '100%' }}>
            Push to Spotify
          </button>
        </div>
        <button style={{ position: 'fixed', left: 'calc(200px + 20px)', bottom: '20px', backgroundColor: '#ff0000', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

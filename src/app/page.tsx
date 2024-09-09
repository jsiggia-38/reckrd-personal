'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, Box, CircularProgress, Container, Grow, IconButton, TextField } from '@mui/material';
import { debounce } from 'lodash'
import Generated from '@/app/components/generated'
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios'

interface LastFMImage {
  text: string,
  size: string
}

interface LastFMTrack {
  artist: string,
  listeners: string,
  mbid: string,
  name: string,
  streamable: string,
  url: string
  cover_image: string
}

interface SimilarSong {
  trackName: string,
  artistName: string,
  trackMBID: string,
  artistMBID: string,
  url: string
  album: MusicBrainzAlbum;
  image: string;
}

interface MusicBrainzAlbum {
  title: string,
  mbid: string,
  image: string,
}

interface AddedTrack {
  track: LastFMTrack;
  tags: LastFMTag[];
}

interface LastFMTag {
  tagName: string,
  total: number
}

enum GenerationState {
  SONG_SELECT,
  GENERATED
}

export default function Home() {
  const [searchSong, setSearchSong] = useState('');
  const [songList, setSongList] = useState<any[]>([]);
  const router = useRouter();

  const [songSearch, setSongSearch] = useState<LastFMTrack[]>([]);
  const [songInput, setSongInput] = useState<LastFMTrack>();
  const [addedSongs, setAddedSongs] = useState<AddedTrack[]>([]);

  const [similarSongs, setSimilarSongs] = useState<SimilarSong[]>([]);

  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.SONG_SELECT);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);

  const PROXY_BASE_URL = "http://18.188.237.225:1337";
  const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleInput = (event: any) => {

    setSearchSong(event.target.value)

    handleInputCalls(event)
  }

  const handleInputCalls = useCallback(debounce((event) => {
    if (event.target.value != "")
    {
      axios.get(PROXY_BASE_URL + "/search?api_key=" + API_KEY + "&track=" + event.target.value, {
      })
      .then(response => {
        console.log(response)
        setSongSearch(response.data.trackmatches.track)
      })
      .catch(error => {
        console.error('Error: ', error);
      })
    }
    else
    {
      setSongSearch([]);
    }
  }, 1000), [])

  const handleAddSong = async (song: LastFMTrack) => {

    try {
      const mbidresponse = await axios.get(PROXY_BASE_URL + '/get_release_mbid?api_key=' + API_KEY + '&track=' + song.name + "&artist=" + song.artist);

      console.log(mbidresponse.data.mbid)

      const cover_art_response = await axios.get(PROXY_BASE_URL + '/get_cover_art?mbid=' + mbidresponse.data.mbid)

      console.log(cover_art_response)

      if (cover_art_response.data.images.length > 0)
      {
        song.cover_image = cover_art_response.data.images[0].thumbnails["250"];
        for (let i = 0; i < cover_art_response.data.images.length; i++) {
          if (cover_art_response.data.images[i].front == true)
            song.cover_image = cover_art_response.data.images[i].thumbnails["250"];
        }
        
      }
        

      console.log(song)

      const tag_response = await axios.get(PROXY_BASE_URL + "/get_song_tags?api_key=" + API_KEY + "&track=" + song.name + "&artist=" + song.artist);

      console.log(tag_response);

      const myAddedSongs = [...addedSongs, {
        track: song,
        tags: tag_response.data
      }];

      setAddedSongs(myAddedSongs)

      console.log(myAddedSongs);
    } catch (error) {
      console.error(error)
    }

      
    
  };

  useEffect(() => {
    console.log(similarSongs);
  }, [similarSongs])

  const handleDeleteSong = (index: number) => {
    setAddedSongs((prevSongs) => prevSongs.filter((_, i) => i !== index));
  };

  const handleFindSimilar = async() => {
    setIsInitialLoading(true);
    for (const song of addedSongs) {
      let finalized = false;
      let windowMin = 25;
      let windowMax = 75;
      let windowRand = Math.floor(Math.random() * ((windowMax + 1) - windowMin) + windowMin)

      let pageMin = 0;
      let pageMax = song.tags[0].total - windowRand
      let pageRand = Math.floor(Math.floor(Math.random() * ((pageMax + 1) - pageMin) + pageMin) / windowRand)

      let similarSongsResponse

      while (!finalized) {

        similarSongsResponse = await axios.get(PROXY_BASE_URL + "/similar?fm_api_key=" + API_KEY + "&tag=" + song.tags[0].tagName + "&page=" + pageRand + "&limit=" + windowRand)

        if (similarSongsResponse.data.length == 0) {
          pageMax = pageMax / 2;
          pageRand = Math.floor(Math.floor(Math.random() * ((pageMax + 1) - pageMin) + pageMin) / windowRand)
        }
        else
        {
          finalized = true;
        }

        await sleep(500)
      }

      let newSimilarSongs = []

      if (similarSongsResponse)
      {


        newSimilarSongs = similarSongsResponse.data;

        for (let i = 0; i < newSimilarSongs.length; i++) {

          try {
            let artResponse = await axios.get(PROXY_BASE_URL + "/get_cover_art?mbid=" + newSimilarSongs[i].album.mbid);

            console.log(artResponse.data.images[0])

            for (const image of artResponse.data.images) {
              if (image.front) {
                newSimilarSongs[i].album.image = image.image;
                break;
              }
            }

            if (!newSimilarSongs[i].album.image)
              newSimilarSongs[i].album.image = ""
            
          } catch (error) {
            console.error(error)
            newSimilarSongs[i].album.image = ""
          }

          await sleep(50)
        }
      }

      console.log(newSimilarSongs)


      setSimilarSongs((prevSimilarSongs) => [
        ...prevSimilarSongs,
        ...newSimilarSongs
      ])

      if (similarSongs.length === 0 && newSimilarSongs.length > 0) {
        setIsInitialLoading(false);  
        setIsLoading(true);  
      }

      setGenerationState(GenerationState.GENERATED)

      await sleep(350)
    }

    setIsLoading(false);
  }



  return (
    <>
      {isInitialLoading ? (
        <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
          <CircularProgress color = "inherit" />
        </div>

      ) : (
        generationState == GenerationState.SONG_SELECT ? (
        <div style = {{color: '#fff', marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>Add songs to the list</h1>
        <div style={{ backgroundColor: '#1E3B57', width: '100%', maxWidth: '600px', height: '400px', overflowY: 'scroll', padding: '10px', borderRadius: '8px', marginBottom: '20px', marginTop: '10px' }}>
        <ul style={{ listStyleType: 'none', padding: 3 }}>
            {addedSongs.map((song, index) => (
              <Grow
                key={index}
                in={index === recentlyAddedIndex || recentlyAddedIndex === null}
                timeout={500}
                onExited={() => {
                  setRecentlyAddedIndex(null);
                }}
              >
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', backgroundColor: '#1E3B57', padding: '10px', borderRadius: '4px' }}>
                  <IconButton 
                    onClick={() => handleDeleteSong(index)}
                    style={{ color: '#ff0000', marginRight: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <img src={song.track.cover_image} alt={song.track.name} style={{ width: '60px', height: '60px', marginRight: '10px', borderRadius: '4px' }} /> 
                  <div>
                    <div>{song.track.artist} - {song.track.name}</div>
                  </div>
                </li>
              </Grow>
            ))}
          </ul>
        </div>
  
        <Container maxWidth="sm">
          <Box sx={{ position: 'fixed', bottom: '15em', width: '20%' }}>
            <Autocomplete
            freeSolo
            fullWidth
            options={songSearch}
            onChange={(event, newValue: any) => handleAddSong(newValue)}
            filterOptions={(options) => options}
            getOptionLabel={(option: string | LastFMTrack) => {
              if (typeof option == 'string') {
                return "N/A"
              } else {
                return `${option.artist} - ${option.name}`
              }
            }}
            renderInput={(params) => (
              <TextField
              sx ={{
                '& .MuiInputBase-root': {
                    borderRadius: 1.3,
                    color: 'white',
                    fontWeight: 700
                  },
                  '& .MuiInputLabel-root': {
                    color: '#E5E5E5', // Label color
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#FFFFFF', // Label color when focused 
                    },
                  },
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1) !important', // Adjust opacity
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15) !important', // Hover opacity
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2) !important', // Focused opacity
                    },
                  },
                  '& .MuiSelect-select': {
                    color: '#E5E5E5', // Change color based on selection,
                    fontWeight: 700
                  },
            }}
            {...params} value={searchSong} onChange={handleInput} fullWidth id="lastfm-search" label="Search Songs" variant="filled"/>
            )}/>
          </Box>
        </Container>
  
  
  
        {/* <div style = {{ position: 'fixed', bottom: '50px', marginTop: '50px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <input type = "text" value = {searchSong} onChange = {(e) => setSearchSong(e.target.value)} placeholder = "Add a song here" style = {{ backgroundColor: '#1E3B57', padding: '10px', width: '300px', marginRight: '10px' }}/>
  
          {searchSong && 
          <div style = {{overflowY: 'auto', maxHeight: '200px', width: '300px'}}>
            {filteredSongs.map((song) => (
              <div key = {song.id} onClick = {() => handleAddSong(song)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005B9A'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3B57'} style={{ backgroundColor: '#1E3B57', color: '#fff', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', cursor: 'pointer' }}>
                <div>
                  <div>{song.title}</div>
                  <div>{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        }
        </div> */}
  
        <button onClick={handleFindSimilar} style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#376FA3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Generate Playlist
        </button>
      </div>

    ) : (
      <>
        <Generated songs={similarSongs}/>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </div>
        )}
      </>

     )
    )}
  </>
    
  );
}
import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Flex, Input, InputGroup, InputLeftElement, List, ListItem } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import _, { debounce } from 'lodash';

const locationiqKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  // console.log(suggestion.name)
  return (
    <ListItem
      boxShadow="0 1px 5px rgba(0, 0, 0, 0.65)"
      borderRadius="4px"
      styleType="none"
    >{suggestion.name}</ListItem>
  );
}

class LocationInput extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      isLoading: false
    };

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 1500);
  }
  
  async loadSuggestions(value) {
    this.setState({
      isLoading: true
    });
    
    // Fake an AJAX call
    try {
      // Make an API call to fetch suggestions based on the input value
      const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${locationiqKey}&q=${value}&limit=5`);
      const data = await response.json();

      const suggestions = data.map(item => ({
        name: item.display_name,
        // Add other properties as needed
      }));

      if (value === this.state.value) {
        this.setState({
          isLoading: false,
          suggestions,
        });
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.setState({
        isLoading: false,
      });
    }
  }
  
  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });

    this.props.onChange(newValue);
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.debouncedLoadSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions, isLoading } = this.state;
    const inputProps = {
      placeholder: "Where would you like to go?",
      value,
      onChange: this.onChange
    };
    const status = (isLoading ? 'Loading...' : 'Type to load suggestions');

    return (
      <div>
        {/* <div className="status"> */}
        {/*   <strong>Status (for debugging):</strong> {status} */}
        {/* </div> */}
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        renderInputComponent={(inputProps) => 
            <InputGroup>
              <InputLeftElement><SearchIcon /></InputLeftElement>
              <Input {...inputProps}
                boxShadow="0 1px 5px rgba(0, 0, 0, 0.65)"
                borderRadius="4px"
                width="280px"
              />
            </InputGroup>
          }
        renderSuggestionsContainer={({ containerProps, children }) => (
          <Box {...containerProps} position="absolute" zIndex="1">
            <List styleType={"none"}>{children}</List>
          </Box>
        )}
      />
      </div>
    );
  }
}

export default LocationInput


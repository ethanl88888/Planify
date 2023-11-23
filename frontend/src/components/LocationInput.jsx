import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Flex, Input } from '@chakra-ui/react';
import _, { debounce } from 'lodash';

const locationiqKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;

/* --------------- */
/*    Component    */
/* --------------- */

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.name}</span>
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

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 2000);
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
        <div className="status">
          <strong>Status (for debugging):</strong> {status}
        </div>
        <Autosuggest 
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />
      </div>
    );
  }
}

export default LocationInput


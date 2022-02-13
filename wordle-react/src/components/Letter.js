import './Letter.css';

function Letter({ letter, status, column, row }) {
    const style = {
        'gridColumnStart': column,
        'gridColumnEnd': column + 1,
        'gridRowStart': row,
        'gridRowEnd': row + 1
    }

    return (
        <div className={"Letter " + status} style={style}>
            {letter}
        </div>
    );
}

export default Letter;